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
  const rating = product.averageRating || 0;
  const reviews = product.totalReviews || 0;
  const stock = activeVariant?.stockQuantity ?? 0;

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
    <div className="w-full lg:w-5/12 flex flex-col">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {rating > 0 && (
          <>
            <div className="flex items-center gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar key={star} className={star <= Math.round(rating) ? 'fill-current' : ''} />
              ))}
            </div>
            <span className="font-medium">{rating.toFixed(1)}/5</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500">{reviews} Đánh giá</span>
          </>
        )}
        {(product.totalSold ?? 0) > 0 && (
          <>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500">Đã bán <strong>{(product.totalSold ?? 0) > 999 ? `${((product.totalSold ?? 0) / 1000).toFixed(1)}k` : product.totalSold}</strong></span>
          </>
        )}
        {product.brandName && (
          <>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500">Thương hiệu: <strong>{product.brandName}</strong></span>
          </>
        )}
      </div>

      <div className="flex items-end gap-4 mb-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        {canShowVariantPrice ? (
          <>
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              {formatPrice(price)}
            </span>
            {comparePrice > price && (
              <span className="text-xl text-slate-400 line-through mb-1">{formatPrice(comparePrice)}</span>
            )}
          </>
        ) : isSelectionRequired && !isSelectionComplete && variantSalePriceRange ? (
          <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
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
      {canShowVariantPrice && pricing?.isFlashSale && (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-md">
          <FiZap className="text-base" />
          Flash Sale -{pricing.discount}%{activeFlashItem ? ` • Còn ${activeFlashItem.remainingStock} suất giá sốc` : ''}
        </div>
      )}

      {highlightSpecs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {highlightSpecs.map(([key, value]) => (
            <span key={key} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-md font-medium rounded-lg border border-slate-200 dark:border-slate-700">
              {value}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-6 mb-8">
        <VariantSelector
          variants={variants}
          variantSchema={product.variantSchema}
          pricingMap={variantPricingMap}
          selectedIndex={resolvedVariantIdx >= 0 ? resolvedVariantIdx : 0}
          onSelect={handleSelectVariant}
          selectedOptions={selectedOptions}
          onSelectOption={handleSelectOption}
        />

        <div className="pt-2">
          <h3 className="font-bold mb-3">Số lượng</h3>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, stock)}
              disabled={!canPurchase || stock <= 0}
              overMaxWarning={`Chỉ còn ${stock} sản phẩm có sẵn!`}
            />
            <span className="text-md text-slate-500 font-medium">
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
                className="!h-10 !rounded-xl"
              >
                Xóa lựa chọn
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <button
          onClick={async () => {
            if (!isAuthenticated) {
              toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
              navigate('/login');
              return;
            }
            if (product.id) await toggleWishlist(product.id);
          }}
          className={`w-14 h-14 shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all ${
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
          icon={<FiShoppingCart className="text-xl" />}
          className="flex-1 !h-14 !rounded-2xl !text-lg !font-bold"
        >
          Thêm vào giỏ
        </PrimaryButton>
        <PrimaryButton
          onClick={handleBuyNow}
          disabled={!canPurchase || stock === 0 || !canShowVariantPrice || price <= 0}
          icon={<FiZap className="text-xl" />}
          className="flex-1 !h-14 !rounded-2xl !text-lg"
        >
          Mua ngay
        </PrimaryButton>
      </div>
    </div>
  );
}
