import { memo } from 'react';
import { formatPrice } from '@/utils/format';
import type { VariantSelectorProps } from '@/types';

/**
 * Reusable variant-selector chip group.
 * Shows each variant as a button with name + pricing info.
 * Automatically hidden when there is only one variant.
 */
function VariantSelector({
  variants,
  pricingMap,
  selectedIndex,
  onSelect,
  label = 'Phiên bản',
  className = '',
}: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className={className}>
      <h3 className="font-bold mb-3">{label}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {variants.map((v, idx) => {
          const pricing = pricingMap[v.id];
          const isActive = selectedIndex === idx;

          return (
            <button
              key={v.id}
              onClick={() => onSelect(idx)}
              className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all text-center ${
                isActive
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'
              }`}
            >
              {v.variantName || v.sku}
              <span className="block text-sm mt-0.5">
                {formatPrice(pricing.salePrice)}
              </span>
              {pricing.originPrice > pricing.salePrice && (
                <span className="block text-[11px] mt-0.5 text-slate-400 line-through">
                  {formatPrice(pricing.originPrice)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(VariantSelector);
