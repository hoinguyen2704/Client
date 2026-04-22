import { memo, type ChangeEvent, useEffect, useRef } from "react";
import { FiEye, FiEyeOff, FiLoader, FiPlus, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { ExpandToggle, SearchableDropdown, TrashButton } from "@/components";
import { useTranslation } from "react-i18next";
import { formatDateFull as formatDateTime } from "@/utils/format";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";
import type { VariantCardProps } from "./types";
import { formatVariantSummaryValue, getVariantSelectOptions } from "./utils";

const summaryChipClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300";

export default memo(function VariantCard(props: VariantCardProps) {
  const { t, i18n } = useTranslation("adminCatalog");
  const {
    variant,
    index,
    variantUiKey,
    variantOrder,
    variantSchema,
    isExpanded,
    isVariantUploading,
    canRemove,
    autoFocusSku,
    variantFileInputRefs,
    onAutoFocusHandled,
    onToggleExpanded,
    removeVariant,
    updateVariant,
    isDirty,
    resetVariant,
    updateVariantSelection,
    onOpenCreateAttributeModal,
    createVariantAttributeOption,
    creatingOptionByFieldKey,
    regenerateVariantSku,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
  } = props;

  const sales = resolveVariantSalesMetrics(variant);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const skuInputRef = useRef<HTMLInputElement | null>(null);
  const createdAtText = variant.createdAt
    ? formatDateTime(variant.createdAt, i18n.language)
    : t("variantCard.timeUnavailable");
  const updatedAtText = variant.updatedAt
    ? formatDateTime(variant.updatedAt, i18n.language)
    : variant.createdAt
      ? formatDateTime(variant.createdAt, i18n.language)
      : t("variantCard.timeUnavailable");

  useEffect(() => {
    if (!autoFocusSku || !isExpanded) return;

    const rootElement = rootRef.current;
    if (rootElement) {
      const topOffset =
        window.innerWidth >= 1280 ? 176 : window.innerWidth >= 768 ? 148 : 124;
      const nextTop = Math.max(
        window.scrollY + rootElement.getBoundingClientRect().top - topOffset,
        0,
      );
      window.scrollTo({
        top: nextTop,
        behavior: "smooth",
      });
    }

    const frame = window.requestAnimationFrame(() => {
      skuInputRef.current?.focus();
      skuInputRef.current?.select();
      onAutoFocusHandled?.();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [autoFocusSku, isExpanded, onAutoFocusHandled]);

  return (
    <div
      ref={rootRef}
      style={{ scrollMarginTop: "11rem" }}
      className={`relative overflow-hidden rounded-2xl border bg-white transition-all dark:bg-slate-900 ${
        isExpanded
          ? "border-purple-200 shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-purple-800"
          : "border-slate-200 shadow-sm dark:border-slate-700"
      }`}
    >
      <div className="bg-gradient-to-r from-white via-slate-50 to-purple-50/70 px-4 py-3.5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 flex-1 min-w-0 pr-0 xl:pr-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex shrink-0 h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-bold text-white shadow-sm">
                  {variantOrder}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-md font-semibold text-body">
                    {t("variantCard.title", { order: variantOrder })}
                    {variant.variantName ? ` - ${variant.variantName}` : ""}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ${
                      variant.active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {variant.active
                      ? t("variantCard.statusActive")
                      : t("variantCard.statusInactive")}
                  </span>
                  {isVariantUploading && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <FiLoader className="animate-spin" />
                      {t("variantCard.uploading")}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden xl:flex items-center gap-x-4 text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <span>
                  {t("variantCard.createdAt")}:{" "}
                  <strong className="font-semibold text-slate-600 dark:text-slate-300">
                    {createdAtText}
                  </strong>
                </span>
                <span>
                  {t("variantCard.updatedAt")}:{" "}
                  <strong className="font-semibold text-slate-600 dark:text-slate-300">
                    {updatedAtText}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={summaryChipClass}>
                {t("variantCard.sku")}:{" "}
                {variant.sku || t("variantCard.notEntered")}
              </span>
              <span className={summaryChipClass}>
                {t("variantCard.price")}:{" "}
                {formatVariantSummaryValue(
                  variant.price,
                  t("variantCard.notEntered"),
                )}
              </span>
              <span className={summaryChipClass}>
                {t("variantCard.stock")}:{" "}
                {formatVariantSummaryValue(
                  variant.stock,
                  t("variantCard.notEntered"),
                )}
              </span>
              <span className={summaryChipClass}>
                {t("variantCard.net")}: {sales.net.toLocaleString()}
              </span>
            </div>

            {/* Mobile fallback for dates */}
            <div className="flex xl:hidden flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>
                {t("variantCard.createdAt")}:{" "}
                <strong className="font-semibold text-slate-600 dark:text-slate-300">
                  {createdAtText}
                </strong>
              </span>
              <span>
                {t("variantCard.updatedAt")}:{" "}
                <strong className="font-semibold text-slate-600 dark:text-slate-300">
                  {updatedAtText}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {isDirty && (
              <button
                type="button"
                onClick={() => resetVariant(index)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30"
              >
                <FiRotateCcw />
                {t("variantCard.reset")}
              </button>
            )}
            <ExpandToggle
              expanded={isExpanded}
              onToggle={onToggleExpanded}
              expandLabel={t("variantCard.expand")}
              collapseLabel={t("variantCard.collapse")}
              className="!rounded-xl border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80"
            />
            {canRemove && (
              <TrashButton
                onClick={() => removeVariant(index)}
                iconOnly={false}
              >
                {t("variantCard.remove")}
              </TrashButton>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("variantCard.sku")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={skuInputRef}
                    type="text"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    placeholder={t("variantCard.skuPlaceholder")}
                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-md outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => regenerateVariantSku(index)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-md font-medium text-slate-700 transition-colors hover:border-purple-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-purple-600"
                    title={t("variantCard.regenTitle")}
                  >
                    Regen
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {variant.skuMode === "manual"
                    ? t("variantCard.skuModeManual")
                    : t("variantCard.skuModeSuggested")}
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("variantCard.autoName")}
                </label>
                <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-md text-slate-700 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {variant.variantName || t("variantCard.defaultName")}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("variantCard.priceLabel")}
                </label>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(index, "price", e.target.value)
                  }
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-md outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("variantCard.compareAtPriceLabel")}
                </label>
                <input
                  type="number"
                  value={variant.compareAtPrice}
                  onChange={(e) =>
                    updateVariant(index, "compareAtPrice", e.target.value)
                  }
                  placeholder={t("variantCard.compareAtPricePlaceholder")}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-md outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("variantCard.stockLabel")}
                </label>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(index, "stock", e.target.value)
                  }
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-md outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    updateVariant(index, "active", !variant.active)
                  }
                  className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-md font-medium transition-colors ${
                    variant.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  {variant.active ? <FiEye /> : <FiEyeOff />}
                  {variant.active
                    ? t("variantCard.statusActive")
                    : t("variantCard.statusInactive")}
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("variantCard.salesLabel")}
                </label>
                <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-md font-semibold text-slate-700 dark:text-slate-200">
                    {sales.gross.toLocaleString()} /{" "}
                    {sales.returned.toLocaleString()} /{" "}
                    {sales.net.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-md font-semibold text-body">
                    {t("variantCard.attributesTitle")}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {variantSchema.length > 0
                      ? t("variantCard.attributesDescription")
                      : t("variantCard.attributesEmptyDescription")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenCreateAttributeModal}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-3 text-sm font-semibold text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:bg-slate-900 dark:text-purple-300 dark:hover:bg-slate-800"
                >
                  <FiPlus />
                  {t("variantCard.addAttribute")}
                </button>
              </div>

              {variantSchema.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {variantSchema.map((attribute) => {
                    const selectedOptionId =
                      variant.selections?.[attribute.id] || "";
                    const { selectOptions, selectedValue } =
                      getVariantSelectOptions(attribute, selectedOptionId);
                    const fieldKey = `${variantUiKey}:${attribute.id}`;

                    return (
                      <div key={`${variantUiKey}-${attribute.id}`}>
                        <SearchableDropdown
                          label={attribute.name}
                          value={selectedValue}
                          onChange={(optionId) =>
                            updateVariantSelection(index, attribute.id, optionId)
                          }
                          items={selectOptions.map((option) => ({
                            id: option.value,
                            name: option.label,
                          }))}
                          onCreateNew={(label) =>
                            createVariantAttributeOption(
                              index,
                              variantUiKey,
                              attribute.id,
                              label,
                            )
                          }
                          isCreatingProcess={Boolean(creatingOptionByFieldKey[fieldKey])}
                          allowClear={false}
                          required={false}
                          labelClassName="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted"
                          buttonClassName="h-10"
                          placeholder={attribute.name}
                          searchPlaceholder={t("variantCard.searchPlaceholder", {
                            attribute: attribute.name,
                          })}
                          createPlaceholder={t("variantCard.newValuePlaceholder", {
                            attribute: attribute.name,
                          })}
                          createAddLabel={t("variantCard.addValue")}
                          emptyLabel={t("variantCard.emptyOptions")}
                          duplicateCreateHint={t("variantCard.valueDuplicateHint")}
                          renderMode="portal"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                  {t("variantCard.attributesEmptyState")}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-md font-semibold text-body">
                    {t("variantCard.imagesTitle")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("variantCard.imagesDescription", {
                      sku: variant.sku || t("variantCard.notEntered"),
                    })}
                  </p>
                </div>
                {isVariantUploading && (
                  <FiLoader className="animate-spin text-purple-500" />
                )}
              </div>

              <input
                ref={(el) => {
                  variantFileInputRefs.current[variantUiKey] = el;
                }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const files = Array.from(e.target.files || []);
                  void handleVariantFilesSelected(index, files);
                  e.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={() =>
                  variantFileInputRefs.current[variantUiKey]?.click()
                }
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-md font-medium text-slate-700 transition-colors hover:border-purple-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-purple-600"
              >
                {t("variantCard.uploadImages")}
              </button>

              {variant.pendingFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {variant.pendingFiles.map((file, fileIndex) => (
                    <div
                      key={`${variantUiKey}-pending-${fileIndex}`}
                      className="relative aspect-square overflow-hidden rounded-lg border border-amber-300 dark:border-amber-700"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Pending ${fileIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-10 font-bold text-white">
                        {t("variantCard.pendingBadge")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          removeVariantPendingFile(index, fileIndex)
                        }
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-red-500/90 text-white"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {variant.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {variant.images.map((img) => (
                    <div
                      key={`${variantUiKey}-${img.id}`}
                      className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <img
                        src={img.imageUrl}
                        alt={
                          variant.variantName ||
                          variant.sku ||
                          t("variantCard.variantImageAlt")
                        }
                        className="h-full w-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-gradient-to-r from-purple-500 to-indigo-500 px-1.5 py-0.5 text-10 font-bold text-white">
                          {t("variantCard.primaryBadge")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteVariantImage(index, img.id)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-red-500/90 text-white"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
