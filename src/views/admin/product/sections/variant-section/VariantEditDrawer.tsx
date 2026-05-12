import {
  memo,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiClock,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Button, IconButton, SearchableDropdown } from "@/components";
import type { VariantAttributeSchemaResponse, VariantFormData } from "@/types";
import { formatDateFull as formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";
import type { VariantSectionProps } from "../types";
import { getVariantSelectOptions } from "./utils";

interface VariantEditDrawerProps {
  open: boolean;
  variant?: VariantFormData;
  index: number;
  variantUiKey: string;
  variantSchema: VariantAttributeSchemaResponse[];
  isDirty: boolean;
  isVariantUploading: boolean;
  saving: boolean;
  creatingOptionByFieldKey: Record<string, boolean>;
  variantFileInputRefs: VariantSectionProps["variantFileInputRefs"];
  onClose: () => void;
  onSave: () => void;
  onReset: (index: number) => void;
  onUpdateVariant: VariantSectionProps["updateVariant"];
  onUpdateVariantSelection: VariantSectionProps["updateVariantSelection"];
  onOpenCreateAttributeModal: () => void;
  createVariantAttributeOption: VariantSectionProps["createVariantAttributeOption"];
  regenerateVariantSku: VariantSectionProps["regenerateVariantSku"];
  handleVariantFilesSelected: VariantSectionProps["handleVariantFilesSelected"];
  removeVariantPendingFile: VariantSectionProps["removeVariantPendingFile"];
  deleteVariantImage: VariantSectionProps["deleteVariantImage"];
}

interface PendingImagePreviewProps {
  file: File;
  alt: string;
}

const fieldLabelClass =
  "mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted";

function PendingImagePreview({ file, alt }: PendingImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) {
    return (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800" />
    );
  }

  return (
    <img src={previewUrl} alt={alt} className="h-full w-full object-cover" />
  );
}

function VariantEditDrawer({
  open,
  variant,
  index,
  variantUiKey,
  variantSchema,
  isDirty,
  isVariantUploading,
  saving,
  creatingOptionByFieldKey,
  variantFileInputRefs,
  onClose,
  onSave,
  onReset,
  onUpdateVariant,
  onUpdateVariantSelection,
  onOpenCreateAttributeModal,
  createVariantAttributeOption,
  regenerateVariantSku,
  handleVariantFilesSelected,
  removeVariantPendingFile,
  deleteVariantImage,
}: VariantEditDrawerProps) {
  const { t, i18n } = useTranslation(["adminCatalog", "common"]);
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  const sales = variant ? resolveVariantSalesMetrics(variant) : null;
  const createdAtText = variant?.createdAt
    ? formatDateTime(variant.createdAt, i18n.language)
    : t("adminCatalog:variantCard.timeUnavailable");
  const updatedAtText = variant?.updatedAt
    ? formatDateTime(variant.updatedAt, i18n.language)
    : variant?.createdAt
      ? formatDateTime(variant.createdAt, i18n.language)
      : t("adminCatalog:variantCard.timeUnavailable");

  return createPortal(
    <AnimatePresence>
      {open && variant ? (
        <div className="fixed inset-0 z-[999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-slate-950/55"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            aria-modal="true"
            role="dialog"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
              <div className="min-w-0 space-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="max-w-[280px] truncate font-mono text-sm font-bold uppercase tracking-wide text-muted">
                    {variant.sku || t("adminCatalog:variantCard.notEntered")}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold",
                      variant.active
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-800"
                        : "bg-slate-100 text-muted ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700",
                    )}
                  >
                    {variant.active
                      ? t("adminCatalog:variantCard.statusActive")
                      : t("adminCatalog:variantCard.statusInactive")}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink">
                    {variant.variantName || t("adminCatalog:variantPage.defaultVariant")}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {variant.variantSignature || variant.variantName || t("adminCatalog:variantPage.defaultVariant")}
                  </p>
                </div>
              </div>
              <IconButton
                icon={<FiX />}
                title={t("common:actions.close")}
                ariaLabel={t("common:actions.close")}
                variant="ghost"
                onClick={onClose}
              />
            </header>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-ink">
                      {t("adminCatalog:variantCard.visibilityTitle")}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {t("adminCatalog:variantCard.visibilityDescription")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateVariant(index, "active", !variant.active)}
                    className={cn(
                      "inline-flex h-12 min-w-[128px] items-center justify-center gap-2 rounded-xl border px-4 text-md font-bold transition-colors",
                      variant.active
                        ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                        : "border-slate-300 bg-slate-100 text-muted hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800",
                    )}
                  >
                    {variant.active ? <FiEye /> : <FiEyeOff />}
                    {variant.active
                      ? t("adminCatalog:variantCard.statusActive")
                      : t("adminCatalog:variantCard.statusInactive")}
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                    {t("adminCatalog:variantDrawer.quickEdit")}
                  </h3>
                  {isVariantUploading ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-300">
                      <FiLoader className="animate-spin" />
                      {t("adminCatalog:variantCard.uploading")}
                    </span>
                  ) : null}
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    {t("adminCatalog:variantCard.sku")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(event) =>
                        onUpdateVariant(index, "sku", event.target.value)
                      }
                      placeholder={t("adminCatalog:variantCard.skuPlaceholder")}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm font-semibold text-ink outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => regenerateVariantSku(index)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-body transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800"
                      title={t("adminCatalog:variantCard.regenTitle")}
                    >
                      <FiRotateCcw />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabelClass}>
                      {t("adminCatalog:variantCard.priceLabel")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={variant.price}
                      onChange={(event) =>
                        onUpdateVariant(index, "price", event.target.value)
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-md font-semibold text-ink outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>
                      {t("adminCatalog:variantDrawer.compareAtPriceLabel")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={variant.compareAtPrice}
                      onChange={(event) =>
                        onUpdateVariant(index, "compareAtPrice", event.target.value)
                      }
                      placeholder={t("adminCatalog:variantCard.compareAtPricePlaceholder")}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-md font-semibold text-ink outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>
                      {t("adminCatalog:variantCard.stockLabel")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={variant.stock}
                      onChange={(event) =>
                        onUpdateVariant(index, "stock", event.target.value)
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-md font-semibold text-ink outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>
                      {t("adminCatalog:variantCard.salesLabel")}
                    </label>
                    <div className="flex h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-md font-bold text-body dark:border-slate-700 dark:bg-slate-800/50">
                      {sales
                        ? `${sales.gross.toLocaleString()} / ${sales.returned.toLocaleString()} / ${sales.net.toLocaleString()}`
                        : "0 / 0 / 0"}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-2 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                      {t("adminCatalog:variantDrawer.attributes")}
                    </h3>
                    <p className="mt-1 text-sm text-subtle">
                      {variantSchema.length > 0
                        ? t("adminCatalog:variantCard.attributesDescription")
                        : t("adminCatalog:variantCard.attributesEmptyDescription")}
                    </p>
                  </div>
                  <Button
                    onClick={onOpenCreateAttributeModal}
                    variant="outline"
                    size="sm"
                    icon={<FiPlus />}
                    className="w-full sm:w-auto"
                  >
                    {t("adminCatalog:variantCard.addAttribute")}
                  </Button>
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
                        <SearchableDropdown
                          key={`${variantUiKey}-${attribute.id}`}
                          label={attribute.name}
                          value={selectedValue}
                          onChange={(optionId) =>
                            onUpdateVariantSelection(index, attribute.id, optionId)
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
                          labelClassName={fieldLabelClass}
                          buttonClassName="h-11"
                          placeholder={attribute.name}
                          searchPlaceholder={t("adminCatalog:variantCard.searchPlaceholder", {
                            attribute: attribute.name,
                          })}
                          createPlaceholder={t("adminCatalog:variantCard.newValuePlaceholder", {
                            attribute: attribute.name,
                          })}
                          createAddLabel={t("adminCatalog:variantCard.addValue")}
                          emptyLabel={t("adminCatalog:variantCard.emptyOptions")}
                          duplicateCreateHint={t("adminCatalog:variantCard.valueDuplicateHint")}
                        // renderMode="portal"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-muted dark:border-slate-700 dark:bg-slate-800/30">
                    {t("adminCatalog:variantCard.attributesEmptyState")}
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">
                      {t("adminCatalog:variantCard.imagesTitle")}
                    </h3>
                    <p className="mt-1 break-all text-sm text-muted">
                      {t("adminCatalog:variantCard.imagesDescription", {
                        sku: variant.sku || t("adminCatalog:variantCard.notEntered"),
                      })}
                    </p>
                  </div>
                  {isVariantUploading ? (
                    <FiLoader className="mt-1 shrink-0 animate-spin text-blue-600" />
                  ) : null}
                </div>

                <input
                  ref={(element) => {
                    variantFileInputRefs.current[variantUiKey] = element;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const files = Array.from(event.target.files || []);
                    void handleVariantFilesSelected(index, files);
                    event.target.value = "";
                  }}
                />

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FiUpload />}
                  onClick={() => variantFileInputRefs.current[variantUiKey]?.click()}
                >
                  {t("adminCatalog:variantCard.uploadImages")}
                </Button>

                {variant.pendingFiles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {variant.pendingFiles.map((file, fileIndex) => (
                      <div
                        key={`${variantUiKey}-pending-${file.name}-${fileIndex}`}
                        className="relative aspect-square overflow-hidden rounded-lg border border-amber-300 dark:border-amber-700"
                      >
                        <PendingImagePreview
                          file={file}
                          alt={`Pending ${fileIndex + 1}`}
                        />
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-10 font-bold text-white">
                          {t("adminCatalog:variantCard.pendingBadge")}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariantPendingFile(index, fileIndex)}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white"
                          title={t("adminCatalog:variantDrawer.removeImage")}
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {variant.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {variant.images.map((image) => (
                      <div
                        key={`${variantUiKey}-${image.id}`}
                        className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <img
                          src={image.imageUrl}
                          alt={
                            variant.variantName
                            || variant.sku
                            || t("adminCatalog:variantCard.variantImageAlt")
                          }
                          className="h-full w-full object-cover"
                        />
                        {image.isPrimary ? (
                          <span className="absolute left-1.5 top-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-10 font-bold text-white">
                            {t("adminCatalog:variantCard.primaryBadge")}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => deleteVariantImage(index, image.id)}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white"
                          title={t("adminCatalog:variantDrawer.removeImage")}
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
                  <FiClock className="text-muted" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                    {t("adminCatalog:variantDrawer.activity")}
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <span className="text-muted">
                      {t("adminCatalog:variantCard.createdAt")}
                    </span>
                    <strong className="text-right font-semibold text-body">
                      {createdAtText}
                    </strong>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted">
                      {t("adminCatalog:variantCard.updatedAt")}
                    </span>
                    <strong className="text-right font-semibold text-body">
                      {updatedAtText}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-end">
              {isDirty ? (
                <Button
                  variant="secondary"
                  size="md"
                  icon={<FiRotateCcw />}
                  onClick={() => onReset(index)}
                  className="w-full sm:w-auto"
                >
                  {t("adminCatalog:variantCard.reset")}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {t("common:modal.cancel")}
              </Button>
              <Button
                size="md"
                icon={<FiSave />}
                loading={saving}
                onClick={onSave}
                className="w-full sm:w-auto"
              >
                {t("adminCatalog:variantDrawer.saveChanges")}
              </Button>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default memo(VariantEditDrawer);
