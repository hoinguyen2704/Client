import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiStar, FiHeart, FiShoppingCart, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import type { ProductResponse, FlashSaleItemResponse } from '@/types';

import useCartStore from '@/stores/useCartStore';
import useWishlistStore from '@/stores/useWishlistStore';
import useAuthStore from '@/stores/useAuthStore';
import { cartService } from '@/apis';
import { Button, PrimaryButton, QuantitySelector, VariantSelector } from '@/components';
import { resolveVariantPricing } from '@/utils/pricing';
import { getApiErrorMessage } from '@/utils/error';

interface ProductInfoProps {
  product: ProductResponse;
  flashItemsByVariantId?: Record<string, FlashSaleItemResponse>;
  selectedVariantIdx?: number;
  onSelectedVariantIdxChange?: (idx: number) => void;
}

const clampVariantIndex = (index: number, total: number): number => {
  if (total <= 0) return -1;
  if (index < 0) return 0;
  if (index >= total) return total - 1;
  return index;
};

const toSelectionMap = (
  variant: ProductResponse['variants'][number] | null | undefined,
): Record<string, string> => {
  if (!variant) return {};
  const rows = variant.selections || variant.attributes || [];
  return Object.fromEntries(
    rows.map((attr) => [attr.variantAttributeId, attr.optionId]),
  );
};

const selectionMapEquals = (
  a: Record<string, string>,
  b: Record<string, string>,
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
};

const formatCompactValue = (value: number): string => {
  if (value >= 1000) {
    const compact = value >= 10000 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
    return `${compact.replace(/\.0$/, '')}k`;
  }
  return value.toLocaleString('vi-VN');
};

export default function ProductInfo({
  product,
  flashItemsByVariantId = {},
  selectedVariantIdx: selectedVariantIdxProp,
  onSelectedVariantIdxChange,
}: ProductInfoProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [localSelectedVariantIdx, setLocalSelectedVariantIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const selectedVariantIdx = selectedVariantIdxProp ?? localSelectedVariantIdx;
  const setSelectedVariantIdx = onSelectedVariantIdxChange ?? setLocalSelectedVariantIdx;

  const variants = product.variants || [];
  const requiredAttributeIds = useMemo(() => {
    if (variants.length <= 1) {
      return [];
    }

    if ((product.variantSchema || []).length > 0) {
      return (product.variantSchema || [])
        .map((attribute) => attribute.id)
        .filter(Boolean);
    }

    const ids = new Set<string>();
    variants.forEach((variant) => {
      (variant.selections || variant.attributes || []).forEach((selection) => {
        if (selection?.variantAttributeId) {
          ids.add(selection.variantAttributeId);
        }
      });
    });
    return Array.from(ids);
  }, [product.variantSchema, variants]);
  const isSelectionRequired = requiredAttributeIds.length > 0;
  const isSelectionComplete = !isSelectionRequired
    || requiredAttributeIds.every((attributeId) => Boolean(selectedOptions[attributeId]));
  const attributeNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (product.variantSchema || []).forEach((attribute) => {
      if (attribute?.id) {
        map[attribute.id] = attribute.name;
      }
    });
    variants.forEach((variant) => {
      (variant.selections || variant.attributes || []).forEach((selection) => {
        if (selection?.variantAttributeId && !map[selection.variantAttributeId]) {
          map[selection.variantAttributeId] =
            selection.attributeName || selection.variantAttributeName || 'Phân loại';
        }
      });
    });
    return map;
  }, [product.variantSchema, variants]);
  const missingAttributeNames = useMemo(
    () =>
      requiredAttributeIds
        .filter((attributeId) => !selectedOptions[attributeId])
        .map((attributeId) => attributeNameById[attributeId] || 'Phân loại'),
    [attributeNameById, requiredAttributeIds, selectedOptions],
  );
  const isStructuredSelectionMode = isSelectionRequired;

  // Memoize ALL variant pricing at once — avoids N+1 calls per render
  const variantPricingMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof resolveVariantPricing>> = {};
    variants.forEach((variant) => {
      map[variant.id] = resolveVariantPricing({
        product,
        variant,
        flashItem: flashItemsByVariantId[variant.id],
      });
    });
    return map;
  }, [product, variants, flashItemsByVariantId]);

  useEffect(() => {
    const initialIndex = clampVariantIndex(
      selectedVariantIdxProp ?? 0,
      variants.length,
    );

    if (selectedVariantIdxProp === undefined && initialIndex >= 0) {
      setLocalSelectedVariantIdx(initialIndex);
    }

    if (isStructuredSelectionMode) {
      setSelectedOptions({});
    } else {
      setSelectedOptions(toSelectionMap(initialIndex >= 0 ? variants[initialIndex] : null));
    }
    setQuantity(1);
  }, [product.id, variants, isStructuredSelectionMode]);

  useEffect(() => {
    if (isStructuredSelectionMode) return;
    if (selectedVariantIdxProp === undefined) return;
    const nextIndex = clampVariantIndex(selectedVariantIdxProp, variants.length);
    if (nextIndex < 0) return;

    const nextSelections = toSelectionMap(variants[nextIndex]);
    setSelectedOptions((prev) =>
      selectionMapEquals(prev, nextSelections) ? prev : nextSelections,
    );
  }, [selectedVariantIdxProp, variants, isStructuredSelectionMode]);

  const resolvedVariantIdx = useMemo(() => {
    if (variants.length === 0) return -1;

    if (!isSelectionRequired) {
      return clampVariantIndex(selectedVariantIdx, variants.length);
    }

    if (!isSelectionComplete) {
      return -1;
    }

    const matchedIdx = variants.findIndex((variant) =>
      requiredAttributeIds.every((attributeId) =>
        (variant.selections || variant.attributes || []).some(
          (attr) =>
            attr.variantAttributeId === attributeId &&
            attr.optionId === selectedOptions[attributeId],
        ),
      ),
    );

    return matchedIdx;
  }, [isSelectionComplete, isSelectionRequired, requiredAttributeIds, selectedOptions, selectedVariantIdx, variants]);

  const activeVariant = resolvedVariantIdx >= 0 ? variants[resolvedVariantIdx] : null;
  const activeFlashItem = activeVariant ? flashItemsByVariantId[activeVariant.id] : undefined;

  useEffect(() => {
    if (resolvedVariantIdx < 0) return;
    if (resolvedVariantIdx !== selectedVariantIdx) {
      setSelectedVariantIdx(resolvedVariantIdx);
    }
  }, [resolvedVariantIdx, selectedVariantIdx, setSelectedVariantIdx]);

  const handleSelectOption = useCallback((attributeId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeId]: optionId,
    }));
  }, []);

  const handleClearSelections = useCallback(() => {
    setSelectedOptions({});
    setQuantity(1);
  }, []);

  const handleSelectVariant = useCallback(
    (index: number) => {
      if (isStructuredSelectionMode) return;
      setSelectedVariantIdx(index);
      setSelectedOptions(toSelectionMap(variants[index]));
    },
    [setSelectedVariantIdx, variants, isStructuredSelectionMode],
  );

  const hasAnySelection = useMemo(
    () => Object.values(selectedOptions).some(Boolean),
    [selectedOptions],
  );

  const variantSalePriceRange = useMemo(() => {
    const prices = variants
      .map((variant) => variantPricingMap[variant.id]?.salePrice)
      .filter((value): value is number => Number.isFinite(value) && value > 0);

    if (prices.length === 0) {
      return null;
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [variantPricingMap, variants]);

  const variantSoldRange = useMemo(() => {
    const soldValues = variants.map((variant) => Math.max(0, variant.grossSoldQty ?? 0));
    if (soldValues.length === 0) {
      return null;
    }

    return {
      min: Math.min(...soldValues),
      max: Math.max(...soldValues),
    };
  }, [variants]);

  const fallbackVariantIdx = clampVariantIndex(selectedVariantIdx, variants.length);
  const fallbackVariant = fallbackVariantIdx >= 0 ? variants[fallbackVariantIdx] : null;
  const fallbackPricing = fallbackVariant
    ? variantPricingMap[fallbackVariant.id]
    : resolveVariantPricing({ product });
  const pricing = activeVariant
    ? variantPricingMap[activeVariant.id]
    : (!isSelectionRequired ? fallbackPricing : null);
  const canShowVariantPrice = pricing !== null && (!isSelectionRequired || isSelectionComplete);
  const canPurchase = Boolean(activeVariant) && (!isSelectionRequired || isSelectionComplete);

  const price = pricing?.salePrice ?? 0;
  const comparePrice = pricing?.originPrice ?? 0;
  const discountPercent = pricing?.discount ?? 0;
  const rating = product.averageRating || 0;
  const reviews = product.totalReviews || 0;
  const stock = activeVariant?.stockQuantity ?? 0;
  const totalSold = product.totalSold ?? 0;

  const syncFromServer = useCartStore((state) => state.syncFromServer);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const liked = useWishlistStore(
    useCallback(
      (state) => state.items.some((item) => item.productId === product.id),
      [product.id],
    ),
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const highlightSpecs = useMemo(() => {
    return (product.specs || [])
      .slice(0, 4)
      .map((spec) => [spec.name, spec.value] as [string, string]);
  }, [product.specs]);
  const metaChips = useMemo(() => {
    const chips: string[] = [];

    if (product.category?.name) {
      chips.push(product.category.name);
    }

    if (product.brandName) {
      chips.push(product.brandName);
    }

    if (canPurchase && stock > 0) {
      chips.push(`Còn ${stock} sản phẩm`);
    } else if (!isSelectionRequired && product.outOfStock !== true && variants.length === 0) {
      chips.push('Sẵn hàng');
    }

    if (isSelectionComplete && activeVariant && (activeVariant.grossSoldQty ?? 0) > 0) {
      chips.push(`Đã bán ${formatCompactValue(activeVariant.grossSoldQty ?? 0)}`);
    } else if (totalSold > 0) {
      chips.push(`Đã bán ${formatCompactValue(totalSold)}`);
    }

    if (discountPercent > 0) {
      chips.push(`Giảm ${discountPercent}%`);
    }

    return chips.slice(0, 4);
  }, [
    activeVariant,
    canPurchase,
    discountPercent,
    isSelectionComplete,
    isSelectionRequired,
    product.brandName,
    product.category?.name,
    product.outOfStock,
    stock,
    totalSold,
    variants.length,
  ]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    if (!activeVariant) {
      toast.warning('Vui lòng chọn phiên bản trước khi mua!');
      return;
    }

    try {
      await cartService.addToCart({
        variantId: activeVariant.id,
        quantity,
      });

      await syncFromServer();

      const selectedDisplayName =
        activeVariant.displayName || activeVariant.variantName;
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        description: `${product.name} ${selectedDisplayName ? `(${selectedDisplayName})` : ''}`,
      });
    } catch (error) {
      console.error('Lỗi thêm giỏ hàng API, có thể do chưa đăng nhập:', error);
      toast.error(getApiErrorMessage(error, 'Thêm giỏ hàng thất bại!'));
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }

    if (!activeVariant) {
      toast.warning('Vui lòng chọn phiên bản trước khi mua!');
      return;
    }

    const selectedDisplayName =
      activeVariant.displayName || activeVariant.variantName;

    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product.id,
          variantId: activeVariant.id,
          name: product.name,
          image: product.mainImageUrl,
          price,
          quantity,
          variantName: selectedDisplayName,
        },
      },
    });
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-4 lg:gap-5">
      <h1 className="text-3xl md:text-[2.45rem] font-bold leading-[1.08]">{product.name}</h1>

      <div className="flex items-center gap-x-3 gap-y-2 flex-wrap text-sm md:text-[15px]">
        {rating > 0 && (
          <>
            <div className="flex items-center gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar key={star} className={star <= Math.round(rating) ? 'fill-current' : ''} />
              ))}
            </div>
            <span className="font-medium">{rating.toFixed(1)}/5</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500">{reviews} Đánh giá</span>
          </>
        )}
        {totalSold > 0 && (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500">Đã bán <strong>{formatCompactValue(totalSold)}</strong></span>
          </>
        )}
        {isSelectionComplete && activeVariant && (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500">
              Phân loại đã chọn bán <strong>{(activeVariant.grossSoldQty ?? 0).toLocaleString('vi-VN')}</strong>
            </span>
          </>
        )}
        {product.brandName && (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500">Thương hiệu: <strong>{product.brandName}</strong></span>
          </>
        )}
      </div>

      <div className="inline-flex max-w-[520px] flex-wrap items-end gap-x-4 gap-y-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-4 py-3">
        {canShowVariantPrice ? (
          <>
            <span className="text-[2.1rem] md:text-[2.6rem] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              {formatPrice(price)}
            </span>
            {comparePrice > price && (
              <span className="text-lg md:text-xl text-slate-400 line-through mb-0.5">{formatPrice(comparePrice)}</span>
            )}
          </>
        ) : isSelectionRequired && !isSelectionComplete && variantSalePriceRange ? (
          <span className="text-[2.1rem] md:text-[2.6rem] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            {variantSalePriceRange.min === variantSalePriceRange.max
              ? formatPrice(variantSalePriceRange.min)
              : `${formatPrice(variantSalePriceRange.min)} - ${formatPrice(variantSalePriceRange.max)}`}
          </span>
        ) : (
          <span className="text-lg font-semibold text-slate-500 dark:text-slate-300">
            Vui lòng chọn đầy đủ phân loại để xem giá
          </span>
        )}
      </div>
      {metaChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metaChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex min-h-8 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
      {isSelectionRequired && !isSelectionComplete && variantSoldRange && (
        <div className="text-sm text-slate-500">
          Đã bán theo phân loại:{' '}
          <strong>
            {variantSoldRange.min === variantSoldRange.max
              ? variantSoldRange.min.toLocaleString('vi-VN')
              : `${variantSoldRange.min.toLocaleString('vi-VN')} - ${variantSoldRange.max.toLocaleString('vi-VN')}`}
          </strong>
        </div>
      )}
      {canShowVariantPrice && pricing?.isFlashSale && (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm md:text-md">
          <FiZap className="text-base" />
          Flash Sale -{discountPercent}%{activeFlashItem ? ` • Còn ${activeFlashItem.remainingStock} suất giá sốc` : ''}
        </div>
      )}

      {highlightSpecs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {highlightSpecs.map(([key, value]) => (
            <span key={key} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm md:text-md font-medium rounded-lg border border-slate-200 dark:border-slate-700">
              {value}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-5 pt-1">
        <VariantSelector
          variants={variants}
          variantSchema={product.variantSchema}
          pricingMap={variantPricingMap}
          selectedIndex={resolvedVariantIdx >= 0 ? resolvedVariantIdx : 0}
          onSelect={handleSelectVariant}
          selectedOptions={selectedOptions}
          onSelectOption={handleSelectOption}
        />

        <div className="pt-1">
          <h3 className="font-bold mb-3 text-base">Số lượng</h3>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, stock)}
              size="sm"
              disabled={!canPurchase || stock <= 0}
              overMaxWarning={`Chỉ còn ${stock} sản phẩm có sẵn!`}
            />
            <span className="text-sm md:text-md text-slate-500 font-medium">
              {!isSelectionComplete && isSelectionRequired
                ? `Chọn thêm: ${missingAttributeNames.join(', ')}`
                : stock > 0
                  ? `${stock} sản phẩm có sẵn`
                  : 'Hết hàng'}
            </span>
            {isSelectionRequired && hasAnySelection && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearSelections}
                className="!h-9 !rounded-xl"
              >
                Xóa lựa chọn
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={async () => {
            if (!isAuthenticated) {
              toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
              navigate('/login');
              return;
            }
            if (product.id) await toggleWishlist(product.id);
          }}
          className={`h-12 w-12 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all ${
            liked
              ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-900/20'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          <FiHeart className={`text-2xl ${liked ? 'fill-red-500 cursor-pointer' : ''}`} />
        </button>
        <PrimaryButton
          variant="outline"
          onClick={handleAddToCart}
          disabled={!canPurchase || stock === 0 || !canShowVariantPrice || price <= 0}
          icon={<FiShoppingCart className="text-lg" />}
          className="flex-1 !h-12 !rounded-xl !text-base !font-semibold"
        >
          Thêm vào giỏ
        </PrimaryButton>
        <PrimaryButton
          onClick={handleBuyNow}
          disabled={!canPurchase || stock === 0 || !canShowVariantPrice || price <= 0}
          icon={<FiZap className="text-lg" />}
          className="flex-1 !h-12 !rounded-xl !text-base !font-semibold"
        >
          Mua ngay
        </PrimaryButton>
      </div>
    </div>
  );
}
