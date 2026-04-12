import { memo } from 'react';
import { formatPrice } from '@/utils/format';
import type { VariantSelectorProps } from '@/types';

/**
 * Reusable variant-selector chip group.
 * Dynamically splits variants into two groups if both color and storageCapacity exist.
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

  const activeVariant = variants[selectedIndex];
  if (!activeVariant) return null;

  // Extract unique colors and capacities using Set to maintain order
  const uniqueColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const uniqueCapacities = Array.from(new Set(variants.map(v => v.storageCapacity).filter(Boolean))) as string[];

  // If the data doesn't have structured color and capacity, fallback to classic flat list
  if (uniqueColors.length === 0 && uniqueCapacities.length === 0) {
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

  // Handle cross-dimension selection
  const handleDimensionChange = (newColor?: string, newCapacity?: string) => {
    const targetColor = newColor ?? activeVariant.color;
    const targetCapacity = newCapacity ?? activeVariant.storageCapacity;

    // Try to find the exact match
    let newIdx = variants.findIndex(v => v.color === targetColor && v.storageCapacity === targetCapacity);
    
    if (newIdx === -1) {
      // Fallback if exact combination doesn't exist: prioritize the dimension that just changed
      if (newColor) {
        newIdx = variants.findIndex(v => v.color === newColor);
      } else if (newCapacity) {
        newIdx = variants.findIndex(v => v.storageCapacity === newCapacity);
      }
    }
    
    if (newIdx !== -1) {
      onSelect(newIdx);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Capacity Selector */}
      {uniqueCapacities.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">{uniqueCapacities.length > 1 || uniqueColors.length === 0 ? 'Tuỳ chọn cấu hình / Bộ nhớ' : ''}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uniqueCapacities.map(capacity => {
              const isActive = activeVariant.storageCapacity === capacity;
              const matchingVariants = variants.filter(v => v.storageCapacity === capacity && v.color === activeVariant.color);
              const fallbackVariants = variants.filter(v => v.storageCapacity === capacity);
              const targetVariants = matchingVariants.length > 0 ? matchingVariants : fallbackVariants;
              
              const minPricePricing = targetVariants.reduce((min, curr) => {
                const currPricing = pricingMap[curr.id];
                return currPricing.salePrice < min.salePrice ? currPricing : min;
              }, pricingMap[targetVariants[0].id]);

              return (
                <button
                  key={capacity}
                  onClick={() => handleDimensionChange(undefined, capacity)}
                  className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all text-center ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="block font-bold">{capacity}</span>
                  {minPricePricing && (
                    <>
                      <span className="block text-sm mt-0.5">
                        {formatPrice(minPricePricing.salePrice)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {uniqueColors.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">Màu sắc</h3>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map(color => {
              const isActive = activeVariant.color === color;
              
              // If there's no capacity to choose from, show price under color
              let displayPrice = null;
              if (uniqueCapacities.length === 0) {
                 const matchingVariant = variants.find(v => v.color === color);
                 if (matchingVariant) displayPrice = pricingMap[matchingVariant.id];
              }

              return (
                <button
                  key={color}
                  onClick={() => handleDimensionChange(color, undefined)}
                  className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-all text-center min-w-[100px] ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="block">{color}</span>
                  {displayPrice && (
                    <span className="block text-sm mt-0.5">
                      {formatPrice(displayPrice.salePrice)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(VariantSelector);
