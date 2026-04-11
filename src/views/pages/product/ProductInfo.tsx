import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiStar, FiHeart, FiShoppingCart, FiCheck, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import type { ProductResponse, FlashSaleItemResponse } from '@/types';

import useCartStore from '@/stores/useCartStore';
import useWishlistStore from '@/stores/useWishlistStore';
import useAuthStore from '@/stores/useAuthStore';
import { cartService } from '@/apis';
import { PrimaryButton, QuantitySelector, VariantSelector } from '@/components';
import { resolveVariantPricing } from '@/utils/pricing';
import { getApiErrorMessage } from '@/utils/error';

interface ProductInfoProps {
  product: ProductResponse;
  flashItemsByVariantId?: Record<string, FlashSaleItemResponse>;
  selectedVariantIdx?: number;
  onSelectedVariantIdxChange?: (idx: number) => void;
}

export default function ProductInfo({
  product,
  flashItemsByVariantId = {},
  selectedVariantIdx: selectedVariantIdxProp,
  onSelectedVariantIdxChange,
}: ProductInfoProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [localSelectedVariantIdx, setLocalSelectedVariantIdx] = useState(0);

  const selectedVariantIdx = selectedVariantIdxProp ?? localSelectedVariantIdx;
  const setSelectedVariantIdx = onSelectedVariantIdxChange ?? setLocalSelectedVariantIdx;

  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIdx] || null;
  const activeFlashItem = activeVariant ? flashItemsByVariantId[activeVariant.id] : undefined;

  // Memoize ALL variant pricing at once — avoids N+1 calls per render
  const variantPricingMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof resolveVariantPricing>> = {};
    variants.forEach(v => {
      map[v.id] = resolveVariantPricing({
        product,
        variant: v,
        flashItem: flashItemsByVariantId[v.id],
      });
    });
    return map;
  }, [product, variants, flashItemsByVariantId]);

  const pricing = activeVariant
    ? variantPricingMap[activeVariant.id]
    : resolveVariantPricing({ product });

  const price = pricing.salePrice;
  const comparePrice = pricing.originPrice;
  const rating = product.averageRating || 0;
  const reviews = product.totalReviews || 0;
  const stock = activeVariant?.stockQuantity || 0;

  useEffect(() => {
    if (selectedVariantIdxProp === undefined) {
      setLocalSelectedVariantIdx(0);
    }
    setQuantity(1);
  }, [product.id, selectedVariantIdxProp]);

  const syncFromServer = useCartStore((state) => state.syncFromServer);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore(
    useCallback((s) => s.items.some((item) => item.productId === product.id), [product.id]),
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const highlightSpecs = useMemo(() => {
    try {
      const specs = product.specsJson ? JSON.parse(product.specsJson) as Record<string, string> : {};
      return Object.entries(specs).slice(0, 4);
    } catch {
      return [];
    }
  }, [product.specsJson]);

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
      // Call backend API to add to cart
      await cartService.addToCart({
        variantId: activeVariant.id,
        quantity,
      });

      // Sync cart count from server to get the accurate total
      await syncFromServer();

      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        description: `${product.name} ${activeVariant.variantName ? `(${activeVariant.variantName})` : ''}`,
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

    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product.id,
          variantId: activeVariant?.id,
          name: product.name,
          image: product.mainImageUrl,
          price,
          quantity,
          variantName: activeVariant?.variantName,
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
              {[1, 2, 3, 4, 5].map(star => (
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
        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          {formatPrice(price)}
        </span>
        {comparePrice > price && (
          <span className="text-xl text-slate-400 line-through mb-1">{formatPrice(comparePrice)}</span>
        )}
      </div>
      {pricing.isFlashSale && (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-md">
          <FiZap className="text-base" />
          Flash Sale -{pricing.discount}%{activeFlashItem ? ` • Còn ${activeFlashItem.remainingStock} suất giá sốc` : ''}
        </div>
      )}

      {/* Highlighted Specs from specsJson */}
      {highlightSpecs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {highlightSpecs.map(([key, value]) => (
            <span key={key} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-md font-medium rounded-lg border border-slate-200 dark:border-slate-700">
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Variants */}
      <div className="space-y-6 mb-8">
        {/* Variant buttons */}
        <VariantSelector
          variants={variants}
          pricingMap={variantPricingMap}
          selectedIndex={selectedVariantIdx}
          onSelect={setSelectedVariantIdx}
        />

        {/* Quantity */}
        <div className="pt-2">
          <h3 className="font-bold mb-3">Số lượng</h3>
          <div className="flex items-center gap-6">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={stock}
              overMaxWarning={`Chỉ còn ${stock} sản phẩm có sẵn!`}
            />
            <span className="text-md text-slate-500 font-medium">{stock > 0 ? `${stock} sản phẩm có sẵn` : 'Hết hàng'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
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
          disabled={stock === 0 || price <= 0}
          icon={<FiShoppingCart className="text-xl" />}
          className="flex-1 !h-14 !rounded-2xl !text-lg !font-bold">
          Thêm vào giỏ
        </PrimaryButton>
        <PrimaryButton onClick={handleBuyNow} disabled={stock === 0 || price <= 0}
          icon={<FiZap className="text-xl" />}
          className="flex-1 !h-14 !rounded-2xl !text-lg">
          Mua ngay
        </PrimaryButton>
      </div>
    </div>
  );
}
