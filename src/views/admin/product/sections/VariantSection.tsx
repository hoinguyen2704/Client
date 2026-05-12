import { memo, useEffect, useMemo, useState } from "react";
import { FiLoader, FiPlus, FiSave, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Button, CustomSelect, FormInput, Modal } from "@/components";
import VariantEditDrawer from "./variant-section/VariantEditDrawer";
import VariantListTable from "./variant-section/VariantListTable";
import type { VariantSectionProps as Props } from "./types";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";

type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "all" | "available" | "low" | "out";
type SortOption = "latest" | "priceAsc" | "priceDesc" | "stockAsc" | "stockDesc";

export default memo(function VariantSection(props: Props) {
  const { t } = useTranslation(["adminCatalog", "common"]);
  const {
    productName,
    variants,
    variantSchema,
    saving,
    uploadingVariantKeys,
    creatingOptionByFieldKey,
    creatingAttribute,
    variantFileInputRefs,
    addVariant,
    removeVariant,
    updateVariant,
    isVariantDirty,
    resetVariant,
    updateVariantSelection,
    createVariantAttribute,
    createVariantAttributeOption,
    regenerateVariantSku,
    getVariantUiKey,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
    handleSubmit,
  } = props;

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);
  const [showCreateAttributeModal, setShowCreateAttributeModal] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeOptionLabelsText, setNewAttributeOptionLabelsText] = useState("");

  const hasAtLeastOneOptionLabel = useMemo(
    () =>
      newAttributeOptionLabelsText
        .split(/[,，]/)
        .some((label) => label.trim().length > 0),
    [newAttributeOptionLabelsText],
  );
  const canCreateAttribute =
    newAttributeName.trim().length > 0
    && hasAtLeastOneOptionLabel
    && !creatingAttribute;

  const variantEntries = useMemo(
    () =>
      variants.map((variant, index) => {
        const uiKey = getVariantUiKey(variant, index);
        return {
          index,
          uiKey,
          variant,
          isDirty: isVariantDirty(variant, index),
          isUploading: Boolean(uploadingVariantKeys[uiKey]),
        };
      }),
    [getVariantUiKey, isVariantDirty, uploadingVariantKeys, variants],
  );

  const selectedEntry = useMemo(
    () => variantEntries.find((entry) => entry.uiKey === selectedVariantKey),
    [selectedVariantKey, variantEntries],
  );

  useEffect(() => {
    if (selectedVariantKey && !selectedEntry) {
      setSelectedVariantKey(null);
    }
  }, [selectedEntry, selectedVariantKey]);

  const activeCount = useMemo(
    () => variants.filter((variant) => variant.active).length,
    [variants],
  );
  const totalStock = useMemo(
    () =>
      variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0),
    [variants],
  );
  const dirtyCount = useMemo(
    () => variantEntries.filter((entry) => entry.isDirty).length,
    [variantEntries],
  );

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();
    const entries = variantEntries.filter((entry) => {
      const { variant } = entry;
      const stockValue = Number(variant.stock || 0);

      if (statusFilter === "active" && !variant.active) return false;
      if (statusFilter === "inactive" && variant.active) return false;
      if (stockFilter === "available" && stockValue < 10) return false;
      if (stockFilter === "low" && (stockValue <= 0 || stockValue >= 10)) return false;
      if (stockFilter === "out" && stockValue !== 0) return false;

      if (!normalizedSearch) return true;

      const selectedLabels = variantSchema
        .map((attribute) => {
          const optionId = variant.selections?.[attribute.id];
          return attribute.options.find((option) => option.id === optionId)?.label;
        })
        .filter(Boolean)
        .join(" ");
      const haystack = [
        variant.sku,
        variant.variantName,
        variant.variantSignature,
        selectedLabels,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });

    return [...entries].sort((a, b) => {
      if (sortOption === "priceAsc" || sortOption === "priceDesc") {
        const left = Number(a.variant.price || 0);
        const right = Number(b.variant.price || 0);
        return sortOption === "priceAsc" ? left - right : right - left;
      }

      if (sortOption === "stockAsc" || sortOption === "stockDesc") {
        const left = Number(a.variant.stock || 0);
        const right = Number(b.variant.stock || 0);
        return sortOption === "stockAsc" ? left - right : right - left;
      }

      const leftDate = Date.parse(a.variant.updatedAt || a.variant.createdAt || "") || 0;
      const rightDate = Date.parse(b.variant.updatedAt || b.variant.createdAt || "") || 0;
      return rightDate - leftDate || a.index - b.index;
    });
  }, [searchInput, sortOption, statusFilter, stockFilter, variantEntries, variantSchema]);

  const closeCreateAttributeModal = () => {
    if (creatingAttribute) return;
    setShowCreateAttributeModal(false);
    setNewAttributeName("");
    setNewAttributeOptionLabelsText("");
  };

  const handleCreateAttribute = async () => {
    if (!canCreateAttribute) return;
    try {
      await createVariantAttribute(
        newAttributeName.trim(),
        newAttributeOptionLabelsText.trim(),
      );
      closeCreateAttributeModal();
    } catch {
      // Toast is handled by the form hook; keep modal open for retry.
    }
  };

  const handleAddVariant = () => {
    const nextVariantKey = addVariant();
    if (nextVariantKey) {
      setSelectedVariantKey(nextVariantKey);
    }
  };

  const handleRemoveVariant = (entry: (typeof variantEntries)[number]) => {
    const sales = resolveVariantSalesMetrics(entry.variant);
    const hasKnownOrders = Boolean(
      entry.variant.id && (sales.gross > 0 || sales.returned > 0 || sales.net > 0),
    );

    removeVariant(entry.index);

    if (!hasKnownOrders && selectedVariantKey === entry.uiKey) {
      setSelectedVariantKey(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="mr-1 text-lg font-bold text-ink">
                {t("adminCatalog:variantSection.title")}
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm font-bold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-800">
                {t("adminCatalog:variantSection.count", { count: variants.length })}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800">
                {t("adminCatalog:variantList.stats.active")} {activeCount}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-muted ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                {t("adminCatalog:variantList.stats.hidden")} {Math.max(variants.length - activeCount, 0)}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-body ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                {t("adminCatalog:variantList.stats.stock")} {totalStock.toLocaleString()}
              </span>
              {dirtyCount > 0 ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800">
                  {t("adminCatalog:variantList.dirtyCount", { count: dirtyCount })}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
              <Button
                type="button"
                onClick={handleSubmit}
                icon={<FiSave />}
                loading={saving}
                size="sm"
                className="w-full sm:w-auto"
              >
                {t("adminCatalog:variantDrawer.saveChanges")}
              </Button>
              <Button
                type="button"
                onClick={handleAddVariant}
                icon={<FiPlus />}
                size="sm"
                className="w-full sm:w-auto"
              >
                {t("adminCatalog:variantSection.add")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(260px,1fr)_170px_160px_170px] xl:grid-cols-[minmax(340px,1fr)_180px_170px_180px]">
            <div className="relative min-w-0">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-subtle" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("adminCatalog:variantList.searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-ink outline-none transition-all placeholder:text-subtle focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
              />
            </div>
            <CustomSelect
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              className="h-10 min-w-0"
              options={[
                { value: "all", label: t("adminCatalog:variantList.filters.allStatuses") },
                { value: "active", label: t("adminCatalog:variantCard.statusActive") },
                { value: "inactive", label: t("adminCatalog:variantCard.statusInactive") },
              ]}
            />
            <CustomSelect
              value={stockFilter}
              onChange={(value) => setStockFilter(value as StockFilter)}
              className="h-10 min-w-0"
              options={[
                { value: "all", label: t("adminCatalog:variantList.filters.allStock") },
                { value: "available", label: t("adminCatalog:variantList.filters.available") },
                { value: "low", label: t("adminCatalog:variantList.filters.low") },
                { value: "out", label: t("adminCatalog:variantList.filters.out") },
              ]}
            />
            <CustomSelect
              value={sortOption}
              onChange={(value) => setSortOption(value as SortOption)}
              className="h-10 min-w-0"
              options={[
                { value: "latest", label: t("adminCatalog:variantList.sort.latest") },
                { value: "priceAsc", label: t("adminCatalog:variantList.sort.priceAsc") },
                { value: "priceDesc", label: t("adminCatalog:variantList.sort.priceDesc") },
                { value: "stockAsc", label: t("adminCatalog:variantList.sort.stockAsc") },
                { value: "stockDesc", label: t("adminCatalog:variantList.sort.stockDesc") },
              ]}
            />
          </div>
        </div>
      </div>

      <VariantListTable
        productName={productName}
        entries={filteredEntries}
        totalVariants={variants.length}
        canRemove={variants.length > 1}
        onEdit={(entry) => setSelectedVariantKey(entry.uiKey)}
        onRemove={handleRemoveVariant}
        onToggleActive={(entry) =>
          updateVariant(entry.index, "active", !entry.variant.active)
        }
      />

      <VariantEditDrawer
        open={Boolean(selectedEntry)}
        variant={selectedEntry?.variant}
        index={selectedEntry?.index ?? -1}
        variantUiKey={selectedEntry?.uiKey ?? ""}
        variantSchema={variantSchema}
        isDirty={selectedEntry?.isDirty ?? false}
        isVariantUploading={selectedEntry?.isUploading ?? false}
        saving={saving}
        creatingOptionByFieldKey={creatingOptionByFieldKey}
        variantFileInputRefs={variantFileInputRefs}
        onClose={() => setSelectedVariantKey(null)}
        onSave={handleSubmit}
        onReset={resetVariant}
        onUpdateVariant={updateVariant}
        onUpdateVariantSelection={updateVariantSelection}
        onOpenCreateAttributeModal={() => setShowCreateAttributeModal(true)}
        createVariantAttributeOption={createVariantAttributeOption}
        regenerateVariantSku={regenerateVariantSku}
        handleVariantFilesSelected={handleVariantFilesSelected}
        removeVariantPendingFile={removeVariantPendingFile}
        deleteVariantImage={deleteVariantImage}
      />

      <Modal
        open={showCreateAttributeModal}
        onClose={closeCreateAttributeModal}
        title={t("adminCatalog:variantSection.addAttributeTitle")}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-md text-muted">
            {t("adminCatalog:variantSection.addAttributeDescription")}
          </p>

          <FormInput
            label={t("adminCatalog:variantSection.attributeNameLabel")}
            value={newAttributeName}
            onChange={(event) => setNewAttributeName(event.target.value)}
            placeholder={t("adminCatalog:variantSection.attributeNamePlaceholder")}
            disabled={creatingAttribute}
            autoFocus
          />

          <FormInput
            label={t("adminCatalog:variantSection.attributeFirstValueLabel")}
            value={newAttributeOptionLabelsText}
            onChange={(event) => setNewAttributeOptionLabelsText(event.target.value)}
            placeholder={t("adminCatalog:variantSection.attributeFirstValuePlaceholder")}
            disabled={creatingAttribute}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            <Button
              onClick={closeCreateAttributeModal}
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={creatingAttribute}
            >
              {t("common:modal.cancel")}
            </Button>
            <Button
              onClick={() => {
                void handleCreateAttribute();
              }}
              icon={creatingAttribute ? <FiLoader className="animate-spin" /> : <FiPlus />}
              className="w-full sm:w-auto"
              disabled={!canCreateAttribute}
            >
              {creatingAttribute
                ? t("adminCatalog:variantSection.creatingAttribute")
                : t("adminCatalog:variantSection.addAttributeSubmit")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});
