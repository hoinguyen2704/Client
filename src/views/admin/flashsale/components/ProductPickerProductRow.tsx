import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import type { ProductResponse } from "@/types";
import type { SelectedVariant } from "@/components/dialog/SelectedVariant";
import ProductPickerVariantRow from "./ProductPickerVariantRow";
import { getInventoryBadgeClass } from "./productPickerUtils";

interface ProductPickerProductRowProps {
  product: ProductResponse;
  initialSelectedIdSet: Set<string>;
  selectedMap: Record<string, SelectedVariant>;
  getTotalStock: (product: ProductResponse) => number;
  isExpanded: boolean;
  onToggleProduct: () => void;
  onToggleSelectAll: () => void;
  onToggleVariant: (variantId: string) => void;
}

export default function ProductPickerProductRow({
  product,
  initialSelectedIdSet,
  selectedMap,
  getTotalStock,
  isExpanded,
  onToggleProduct,
  onToggleSelectAll,
  onToggleVariant,
}: ProductPickerProductRowProps) {
  const variants = product.variants || [];
  const someSelected = variants.some(
    (variant) => !!selectedMap[variant.id] || initialSelectedIdSet.has(variant.id),
  );
  const allSelected =
    variants.length > 0 &&
    variants.every(
      (variant) => !!selectedMap[variant.id] || initialSelectedIdSet.has(variant.id),
    );
  const totalSold = product.totalSold || 0;
  const totalStock = getTotalStock(product);

  return (
    <div
      className={`flex flex-col transition-all ${
        someSelected ? "bg-purple-50/25 ring-1 ring-inset ring-purple-200 dark:bg-purple-500/5 dark:ring-purple-500/30" : ""
      }`}
    >
      <div
        className={`px-0 py-0 transition-colors ${
          someSelected
            ? "bg-purple-50/45 hover:bg-purple-50/70 dark:bg-purple-500/10"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        <div className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-[minmax(0,1fr)_170px_140px_170px]">
          <button
            type="button"
            onClick={onToggleProduct}
            className="flex w-full items-center gap-3 px-4 py-4 text-left"
          >
            <div className="text-slate-400 transition-transform duration-200">
              {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
            </div>
            <img
              src={product.mainImageUrl || "/placeholder.png"}
              alt={product.name}
              className="h-11 w-11 flex-shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
            />
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                {product.name}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                <span>{variants.length} phân loại</span>
                {product.category?.name ? <span>• {product.category.name}</span> : null}
                {product.brandName ? <span>• {product.brandName}</span> : null}
              </div>
            </div>
          </button>

          <div className="hidden items-center justify-end border-l border-slate-200 px-4 py-4 text-right text-base font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200 md:flex">
            {totalSold.toLocaleString("vi-VN")}
          </div>
          <div className="hidden items-center justify-end border-l border-slate-200 px-4 py-4 text-right dark:border-slate-700 md:flex">
            <span
              className={`inline-flex min-w-[72px] items-center justify-end rounded-md px-2 py-1 text-sm font-semibold ${getInventoryBadgeClass(
                totalStock,
              )}`}
            >
              {totalStock.toLocaleString("vi-VN")}
            </span>
          </div>

          <div className="flex items-center justify-start gap-2 border-l border-slate-200 px-4 py-4 dark:border-slate-700 md:justify-end">
            {variants.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelectAll();
                }}
                className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  allSelected
                    ? "border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            ) : null}

            {someSelected ? <div className="h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" /> : null}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-14 text-sm text-slate-500 md:hidden">
          <span>
            Đã bán:{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalSold.toLocaleString("vi-VN")}
            </strong>
          </span>
          <span>
            Tồn:{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalStock.toLocaleString("vi-VN")}
            </strong>
          </span>
        </div>
      </div>

      {isExpanded ? (
        <div className="border-t border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {variants.map((variant) => {
              const isAlreadyInSale = initialSelectedIdSet.has(variant.id);
              const isChecked = !!selectedMap[variant.id] || isAlreadyInSale;
              const isNewlySelected = !!selectedMap[variant.id];

              return (
                <ProductPickerVariantRow
                  key={variant.id}
                  variant={variant}
                  isAlreadyInSale={isAlreadyInSale}
                  isChecked={isChecked}
                  isNewlySelected={isNewlySelected}
                  onToggle={() => onToggleVariant(variant.id)}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
