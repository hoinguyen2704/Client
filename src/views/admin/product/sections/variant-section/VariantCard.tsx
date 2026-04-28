import { memo, type ChangeEvent, useEffect, useRef } from "react";
import { FiEye, FiEyeOff, FiLoader, FiPlus, FiRotateCcw, FiTrash2, FiChevronDown } from "react-icons/fi";
import { ExpandToggle, SearchableDropdown, TrashButton } from "@/components";
import { useTranslation } from "react-i18next";
import { formatDateFull as formatDateTime } from "@/utils/format";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";
import type { VariantCardProps } from "./types";
import { formatVariantSummaryValue, getVariantSelectOptions } from "./utils";

const summaryChipClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-sm font-medium text-muted dark:border-slate-700 dark:bg-slate-900/80";

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
      className={`relative overflow-hidden rounded-2xl border bg-white transition-all dark:bg-slate-900 ${isExpanded
        ? "border-blue-200 shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-blue-900/40"
        : "border-slate-200 shadow-sm dark:border-slate-700"
        }`}
    >
      <div
        onClick={onToggleExpanded}
        className="bg-gradient-to-r from-white via-slate-50 to-blue-50/70 px-4 py-3.5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 sm:px-5 cursor-pointer select-none">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 flex-1 min-w-0 pr-0 xl:pr-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                  {variantOrder}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-md font-semibold text-body">
                    {t("variantCard.title", { order: variantOrder })}
                    {variant.variantName ? ` - ${variant.variantName}` : ""}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ${variant.active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-slate-200 text-muted dark:bg-slate-800"
                      }`}
                  >
                    {variant.active
                      ? t("variantCard.statusActive")
                      : t("variantCard.statusInactive")}
                  </span>
                  {isVariantUploading && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      <FiLoader className="animate-spin" />
                      {t("variantCard.uploading")}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden xl:flex items-center gap-x-4 text-sm font-medium text-muted whitespace-nowrap">
                <span>
                  {t("variantCard.createdAt")}:{" "}
                  <strong className="font-semibold text-muted">
                    {createdAtText}
                  </strong>
                </span>
                <span>
                  {t("variantCard.updatedAt")}:{" "}
                  <strong className="font-semibold text-muted">
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
            <div className="flex xl:hidden flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-muted">
              <span>
                {t("variantCard.createdAt")}:{" "}
                <strong className="font-semibold text-muted">
                  {createdAtText}
                </strong>
              </span>
              <span>
                {t("variantCard.updatedAt")}:{" "}
                <strong className="font-semibold text-muted">
                  {updatedAtText}
                </strong>
              </span>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 lg:justify-end"
            onClick={(e) => e.stopPropagation()}>
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
            <div className={`flex items-center justify-center p-2 text-muted transition-transform duration-300 ${isExpanded ? "-rotate-180" : ""}`}>
              <FiChevronDown className="text-xl" />
            </div>
            {canRemove && (
              <TrashButton
                onClick={() => removeVariant(index)}
                iconOnly={false}>
                {t("variantCard.remove")}
              </TrashButton>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left column */}
            <div className="space-y-5 xl:col-span-6">
              {/* Status Toggle Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <div>
                  <p className="font-semibold text-body">{t("variantCard.visibilityTitle")}</p>
                  <p className="text-sm text-muted mt-0.5">{t("variantCard.visibilityDescription")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateVariant(index, "active", !variant.active)}
                  className={`flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border px-5 text-md font-medium transition-all ${
                    variant.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                      : "border-slate-300 bg-white text-muted hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                  }`}
                >
                  {variant.active ? <FiEye /> : <FiEyeOff />}
                  {variant.active ? t("variantCard.statusActive") : t("variantCard.statusInactive")}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                {/* SKU */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("variantCard.sku")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={skuInputRef}
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder={t("variantCard.skuPlaceholder")}
                      className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-md outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => regenerateVariantSku(index)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-body transition-colors hover:border-blue-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-blue-600 dark:hover:bg-slate-600"
                      title={t("variantCard.regenTitle")}
                    >
                      <FiRotateCcw className="text-md" />
                    </button>
                  </div>
                </div>

                {/* Variant name */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("variantCard.autoName")}
                  </label>
                  <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-md text-body dark:border-slate-700 dark:bg-slate-800/50">
                    {variant.variantName || t("variantCard.defaultName")}
                  </div>
                </div>

                {/* Selling price */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("variantCard.priceLabel")}
                  </label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, "price", e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-md outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                {/* Compare-at price */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("variantCard.compareAtPriceLabel")}
                  </label>
                  <input
                    type="number"
                    value={variant.compareAtPrice}
                    onChange={(e) => updateVariant(index, "compareAtPrice", e.target.value)}
                    placeholder={t("variantCard.compareAtPricePlaceholder")}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-md outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("variantCard.stockLabel")}
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-md outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                {/* Sales Metrics */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                    {t("variantCard.salesLabel")}
                  </label>
                  <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-md font-semibold text-body">
                      {sales.gross.toLocaleString()} / {sales.returned.toLocaleString()} / {sales.net.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5 xl:col-span-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <div>
                    <p className="text-md font-semibold text-body">
                      {t("variantCard.attributesTitle")}
                    </p>
                    <p className="text-sm text-muted mt-0.5">
                      {variantSchema.length > 0
                        ? t("variantCard.attributesDescription")
                        : t("variantCard.attributesEmptyDescription")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCreateAttributeModal}
                    className="inline-flex h-9 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
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
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-sm text-muted dark:border-slate-700 dark:bg-slate-800/30">
                    {t("variantCard.attributesEmptyState")}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-md font-semibold text-body">
                      {t("variantCard.imagesTitle")}
                    </p>
                    <p className="text-sm text-muted">
                      {t("variantCard.imagesDescription", {
                        sku: variant.sku || t("variantCard.notEntered"),
                      })}
                    </p>
                  </div>
                  {isVariantUploading && (
                    <FiLoader className="animate-spin text-blue-600" />
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
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-md font-medium text-body transition-colors hover:border-blue-300 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-blue-600"
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
                          <span className="absolute left-1.5 top-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-10 font-bold text-white">
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
        </div>
      )}
    </div>
  );
});
