import { memo, type ChangeEvent } from "react";
import {
  FiEye,
  FiEyeOff,
  FiLoader,
  FiTrash2,
} from "react-icons/fi";
import { CustomSelect, ExpandToggle, TrashButton } from "@/components";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";
import type { VariantCardProps } from "./types";
import {
  formatVariantSummaryValue,
  getVariantSelectOptions,
} from "./utils";

const summaryChipClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300";

export default memo(function VariantCard(props: VariantCardProps) {
  const {
    variant,
    index,
    variantUiKey,
    variantOrder,
    variantSchema,
    isExpanded,
    isVariantUploading,
    canRemove,
    variantFileInputRefs,
    onToggleExpanded,
    removeVariant,
    updateVariant,
    updateVariantSelection,
    regenerateVariantSku,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
  } = props;

  const sales = resolveVariantSalesMetrics(variant);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white transition-all dark:bg-slate-900 ${
        isExpanded
          ? "border-purple-200 shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-purple-800"
          : "border-slate-200 shadow-sm dark:border-slate-700"
      }`}
    >
      <div className="bg-gradient-to-r from-white via-slate-50 to-purple-50/70 px-4 py-3.5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-bold text-white shadow-sm">
                {variantOrder}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-md font-semibold text-body">
                  {`Phân loại ${variantOrder}`}
                  {variant.variantName ? ` - ${variant.variantName}` : ""}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    variant.active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {variant.active ? "Đang bán" : "Đã ẩn"}
                </span>
                {isVariantUploading && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <FiLoader className="animate-spin" />
                    Đang tải ảnh
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={summaryChipClass}>
                SKU: {variant.sku || "Chưa có SKU"}
              </span>
              <span className={summaryChipClass}>
                Giá: {formatVariantSummaryValue(variant.price)}
              </span>
              <span className={summaryChipClass}>
                Tồn: {formatVariantSummaryValue(variant.stock)}
              </span>
              <span className={summaryChipClass}>
                Net: {sales.net.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <ExpandToggle
              expanded={isExpanded}
              onToggle={onToggleExpanded}
              expandLabel="Mở rộng"
              collapseLabel="Thu gọn"
              className="!rounded-xl border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80"
            />
            {canRemove && (
              <TrashButton
                onClick={() => removeVariant(index)}
                iconOnly={false}
              >
                Xóa
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
                  SKU
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    placeholder="VD: IP15P-BLK-256"
                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-md outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => regenerateVariantSku(index)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-md font-medium text-slate-700 transition-colors hover:border-purple-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-purple-600"
                    title="Sinh lại SKU theo tổ hợp thuộc tính"
                  >
                    Regen
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {variant.skuMode === "manual" ? "Manual" : "Suggested"}
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  Tên phân loại (tự dựng)
                </label>
                <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-md text-slate-700 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {variant.variantName || "Mặc định"}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  Giá bán (VNĐ)
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
                  Giá gốc so sánh (VNĐ)
                </label>
                <input
                  type="number"
                  value={variant.compareAtPrice}
                  onChange={(e) =>
                    updateVariant(index, "compareAtPrice", e.target.value)
                  }
                  placeholder="Giá trước giảm"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-md outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                  Tồn kho
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
                  {variant.active ? "Đang bán" : "Đã ẩn"}
                </button>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Gross / Return / Net
                </p>
                <p className="text-md font-semibold text-slate-700 dark:text-slate-200">
                  {sales.gross.toLocaleString("vi-VN")} / {sales.returned.toLocaleString("vi-VN")} / {sales.net.toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {variantSchema.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {variantSchema.map((attribute) => {
                  const selectedOptionId = variant.selections?.[attribute.id] || "";
                  const { selectOptions, selectedValue } = getVariantSelectOptions(
                    attribute,
                    selectedOptionId,
                  );

                  return (
                    <div key={`${variantUiKey}-${attribute.id}`}>
                      <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-muted">
                        {attribute.name}
                      </label>
                      <CustomSelect
                        value={selectedValue}
                        onChange={(optionId) =>
                          updateVariantSelection(index, attribute.id, optionId)
                        }
                        options={selectOptions}
                        className="h-10 w-full"
                        disabled={selectOptions.length === 0}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-md font-semibold text-body">
                    Ảnh theo phân loại
                  </p>
                  <p className="text-sm text-slate-500">
                    Ảnh trong khung này thuộc riêng SKU:{" "}
                    <span className="font-semibold">
                      {variant.sku || "chưa có SKU"}
                    </span>
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
                Tải ảnh cho phân loại
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
                        Chờ lưu
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
                        alt={variant.variantName || variant.sku || "Variant image"}
                        className="h-full w-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-gradient-to-r from-purple-500 to-indigo-500 px-1.5 py-0.5 text-10 font-bold text-white">
                          Chính
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          deleteVariantImage(index, img.id)
                        }
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
