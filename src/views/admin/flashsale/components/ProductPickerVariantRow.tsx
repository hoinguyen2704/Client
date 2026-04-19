import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { AdminProductVariantSummary } from '@/types';
import { formatPrice } from '@/utils/format';
import { getInventoryBadgeClass } from './productPickerUtils';

interface ProductPickerVariantRowProps {
  variant: AdminProductVariantSummary;
  isAlreadyInSale: boolean;
  isChecked: boolean;
  isNewlySelected: boolean;
  onToggle: () => void;
}

export default function ProductPickerVariantRow({
  variant,
  isAlreadyInSale,
  isChecked,
  isNewlySelected,
  onToggle,
}: ProductPickerVariantRowProps) {
  const { t } = useTranslation('adminCatalog');
  const grossSoldQty = variant.grossSoldQty ?? 0;
  const returnedQty = variant.returnedQty ?? 0;
  const netSoldQty = variant.netSoldQty ?? Math.max(grossSoldQty - returnedQty, 0);
  const stock = variant.stockQuantity || 0;

  return (
    <div
      className={`grid grid-cols-1 items-stretch gap-0 transition-colors md:grid-cols-[minmax(0,1fr)_170px_140px_170px]
        ${isAlreadyInSale
          ? 'cursor-not-allowed bg-amber-50/40 opacity-50 dark:bg-amber-500/5'
          : isNewlySelected
            ? 'cursor-pointer border-y border-purple-200/90 bg-purple-100/80 shadow-[inset_5px_0_0_0_rgba(147,51,234,0.95)] hover:bg-purple-100 dark:border-purple-400/30 dark:bg-purple-500/25 dark:hover:bg-purple-500/30'
            : 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/30'
        }`}
      onClick={() => !isAlreadyInSale && onToggle()}
    >
      <div className="flex min-w-0 items-center gap-3 py-3 pl-14 pr-4">
        <div className="flex-shrink-0">
          <div
            className={`flex h-[22px] w-[22px] items-center justify-center rounded-md border-2 transition-all duration-150
              ${isAlreadyInSale
                ? 'border-slate-300 bg-slate-200 dark:border-slate-500 dark:bg-slate-600'
                : isChecked
                  ? 'border-purple-600 bg-purple-600 shadow-[0_0_0_2px_rgba(147,51,234,0.15)]'
                  : 'border-slate-300 bg-white hover:border-purple-400 dark:border-slate-600 dark:bg-slate-800'
              }`}
          >
            {isChecked ? <FiCheck className="text-white" size={14} strokeWidth={3} /> : null}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`text-md font-semibold ${isNewlySelected ? 'text-purple-800 dark:text-purple-200' : 'text-slate-700 dark:text-slate-200'
              }`}
          >
            {variant.variantName || t('productPicker.variantRow.defaultName')}
          </div>
          <div className="text-sm text-slate-500">
            {t('productPicker.variantRow.sku')}: {variant.sku}
            {isAlreadyInSale ? (
              <span className="ml-2 font-medium text-amber-500">
                • {t('productPicker.variantRow.alreadyInSale')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex-shrink-0 text-md font-semibold text-slate-700 dark:text-slate-200">
          {formatPrice(variant.price)}
        </div>
      </div>

      <div className="hidden flex-col items-end justify-center border-l border-slate-200 px-4 py-3 text-sm dark:border-slate-700 md:flex">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {grossSoldQty.toLocaleString()}
        </span>
        <span className="text-sm text-slate-500">
          R {returnedQty.toLocaleString()} / N {netSoldQty.toLocaleString()}
        </span>
      </div>

      <div className="hidden items-center justify-end border-l border-slate-200 px-4 py-3 dark:border-slate-700 md:flex">
        <span
          className={`inline-flex min-w-[72px] items-center justify-end rounded-md px-2 py-1 text-sm font-semibold ${getInventoryBadgeClass(
            stock,
          )}`}
        >
          {stock.toLocaleString()}
        </span>
      </div>

      <div
        className={`hidden items-center justify-end border-l border-slate-200 px-4 py-3 text-sm dark:border-slate-700 md:flex ${isNewlySelected ? 'font-bold text-purple-700 dark:text-purple-200' : 'text-slate-500'
          }`}
      >
        {isNewlySelected
          ? t('productPicker.variantRow.selected')
          : t('productPicker.variantRow.clickToSelect')}
      </div>

      <div className="flex items-center gap-4 px-14 pb-3 text-sm text-slate-500 md:hidden">
        <span>
          {t('productPicker.variantRow.gross')}:{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {grossSoldQty.toLocaleString()}
          </strong>
        </span>
        <span>
          {t('productPicker.variantRow.netAndReturned')}:{' '}
          <strong className="text-slate-600 dark:text-slate-300">
            {netSoldQty.toLocaleString()}/{returnedQty.toLocaleString()}
          </strong>
        </span>
        <span>
          {t('productPicker.variantRow.stock')}:{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {stock.toLocaleString()}
          </strong>
        </span>
      </div>
    </div>
  );
}
