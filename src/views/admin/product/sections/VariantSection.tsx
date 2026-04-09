import type { ChangeEvent } from "react";
import {
  FiPlus,
  FiTrash2,
  FiLoader,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { TrashButton } from "@/components";
import type { VariantSectionProps as Props } from "./types";

export default function VariantSection(props: Props) {
  const {
    variants,
    uploadingVariantKeys,
    variantFileInputRefs,
    addVariant,
    removeVariant,
    updateVariant,
    getVariantUiKey,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
  } = props;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Phân loại hàng</h2>
          <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full">
            {variants.length} phân loại
          </span>
        </div>
        <button
          onClick={addVariant}
          className="text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
        >
          <FiPlus /> Thêm phân loại
        </button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => {
          const variantUiKey = getVariantUiKey(variant, index);
          const isVariantUploading = Boolean(
            uploadingVariantKeys[variantUiKey],
          );
          return (
            <div
              key={variantUiKey}
              className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {variant.variantName || `Phân loại ${index + 1}`}
                  </span>
                </div>
                {variants.length > 1 && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashButton
                      onClick={() => removeVariant(index)}
                      iconOnly={false}
                    >
                      Xóa
                    </TrashButton>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      placeholder="VD: SP-001-BK"
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tên phân loại
                    </label>
                    <input
                      type="text"
                      value={variant.variantName}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "variantName",
                          e.target.value,
                        )
                      }
                      placeholder="VD: Đen - 256GB"
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Giá bán (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Giá gốc so sánh (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={variant.compareAtPrice}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "compareAtPrice",
                          e.target.value,
                        )
                      }
                      placeholder="Giá trước giảm"
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tồn kho
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateVariant(index, "active", !variant.active)
                      }
                      className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                        variant.active
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {variant.active ? <FiEye /> : <FiEyeOff />}
                      {variant.active ? "Đang bán" : "Đã ẩn"}
                    </button>
                  </div>
                </div>

                {/* Variant images */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Ảnh theo phân loại
                      </p>
                      <p className="text-xs text-slate-500">
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
                    className="h-9 px-3 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-600 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Tải ảnh cho phân loại
                  </button>

                  {variant.pendingFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {variant.pendingFiles.map((file, fileIndex) => (
                        <div
                          key={`${variantUiKey}-pending-${fileIndex}`}
                          className="relative aspect-square rounded-lg overflow-hidden border border-amber-300 dark:border-amber-700"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Pending ${fileIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute left-1.5 bottom-1.5 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                            Chờ lưu
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantPendingFile(index, fileIndex)
                            }
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-500/90 text-white flex items-center justify-center"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {variant.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {variant.images.map((img) => (
                        <div
                          key={`${variantUiKey}-${img.id}`}
                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                          <img
                            src={img.imageUrl}
                            alt={
                              variant.variantName ||
                              variant.sku ||
                              "Variant image"
                            }
                            className="w-full h-full object-cover"
                          />
                          {img.isPrimary && (
                            <span className="absolute left-1.5 top-1.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 py-0.5 rounded">
                              Chính
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              deleteVariantImage(index, img.id)
                            }
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-500/90 text-white flex items-center justify-center"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {variants.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl mt-2">
            <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
              <FiPlus className="text-2xl text-purple-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Chưa có phân loại nào
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Bấm "Thêm phân loại" để bắt đầu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
