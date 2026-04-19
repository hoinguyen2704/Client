import { useQuery } from '@tanstack/react-query';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import adminProductService from '@/apis/services/adminProductService';
import type { SelectedVariant } from '@/components/dialog/SelectedVariant';
import type { AdminProductPickerItem, AdminProductVariantSummary } from '@/types';
import ProductPickerVariantRow from './ProductPickerVariantRow';
import { getInventoryBadgeClass } from './productPickerUtils';

interface ProductPickerProductRowProps {
  product: AdminProductPickerItem;
  initialSelectedIdSet: Set<string>;
  selectedMap: Record<string, SelectedVariant>;
  isExpanded: boolean;
  onToggleProduct: () => void;
  onToggleSelectAll: (variants: AdminProductVariantSummary[]) => void;
  onToggleVariant: (variant: AdminProductVariantSummary) => void;
}

export default function ProductPickerProductRow({
  product,
  initialSelectedIdSet,
  selectedMap,
  isExpanded,
  onToggleProduct,
  onToggleSelectAll,
  onToggleVariant,
}: ProductPickerProductRowProps) {
  const { t } = useTranslation('adminCatalog');
  const variantsQuery = useQuery({
    queryKey: ['admin-product-picker-variants', product.id],
    queryFn: ({ signal }) =>
      adminProductService.getVariantSummaries(product.id, { signal }).then((res) => res.data || []),
    enabled: isExpanded,
    staleTime: 5 * 60_000,
  });

  const variants = variantsQuery.data || [];
  const hasNewSelections = Object.values(selectedMap).some((variant) => variant.productId === product.id);
  const someSelected = variants.some(
    (variant) => !!selectedMap[variant.id] || initialSelectedIdSet.has(variant.id),
  ) || hasNewSelections;
  const allSelected =
    variants.length > 0 &&
    variants.every((variant) => !!selectedMap[variant.id] || initialSelectedIdSet.has(variant.id));
  const totalSold = product.totalSold || 0;
  const totalStock = product.totalStock || 0;
  const canSelectAll = variants.length > 0 && !variantsQuery.isPending;

  return (
    <div
      className={`flex flex-col transition-all ${
        someSelected ? 'bg-purple-50/25 ring-1 ring-inset ring-purple-200 dark:bg-purple-500/5 dark:ring-purple-500/30' : ''
      }`}
    >
      <div
        className={`px-0 py-0 transition-colors ${
          someSelected
            ? 'bg-purple-50/45 hover:bg-purple-50/70 dark:bg-purple-500/10'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
              src={product.mainImageUrl || '/placeholder.png'}
              alt={product.name}
              className="h-11 w-11 flex-shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
            />
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                {product.name}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                {product.categoryName ? <span>{product.categoryName}</span> : null}
                {product.brandName ? <span>• {product.brandName}</span> : null}
                {product.productCode ? <span>• {product.productCode}</span> : null}
              </div>
            </div>
          </button>

          <div className="hidden items-center justify-end border-l border-slate-200 px-4 py-4 text-right text-base font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200 md:flex">
            {totalSold.toLocaleString()}
          </div>
          <div className="hidden items-center justify-end border-l border-slate-200 px-4 py-4 text-right dark:border-slate-700 md:flex">
            <span
              className={`inline-flex min-w-[72px] items-center justify-end rounded-md px-2 py-1 text-sm font-semibold ${getInventoryBadgeClass(
                totalStock,
              )}`}
            >
              {totalStock.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-start gap-2 border-l border-slate-200 px-4 py-4 dark:border-slate-700 md:justify-end">
            <button
              onClick={(event) => {
                event.stopPropagation();
                if (!canSelectAll) {
                  return;
                }
                onToggleSelectAll(variants);
              }}
              disabled={!canSelectAll}
              className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                allSelected
                  ? 'border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-purple-300 hover:text-purple-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              {variantsQuery.isPending
                ? t('productPicker.productRow.loading')
                : allSelected
                  ? t('productPicker.productRow.unselectAll')
                  : t('productPicker.productRow.selectAll')}
            </button>

            {someSelected ? <div className="h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" /> : null}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-14 text-sm text-slate-500 md:hidden">
          <span>
            {t('productPicker.productRow.sold')}:{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalSold.toLocaleString()}
            </strong>
          </span>
          <span>
            {t('productPicker.productRow.stock')}:{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalStock.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {isExpanded ? (
        <div className="border-t border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/30">
          {variantsQuery.isPending && variants.length === 0 ? (
            <div className="space-y-3 p-4 pl-14">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/40" />
              ))}
            </div>
          ) : variantsQuery.isError ? (
            <div className="px-4 py-6 pl-14 text-sm text-rose-500">
              {t('productPicker.productRow.loadFailed')}
            </div>
          ) : variants.length === 0 ? (
            <div className="px-4 py-6 pl-14 text-sm text-slate-500">
              {t('productPicker.productRow.noVariants')}
            </div>
          ) : (
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
                    onToggle={() => onToggleVariant(variant)}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
