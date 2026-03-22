import { useState } from 'react';
import { FiStar, FiHeart, FiShoppingCart, FiCheck, FiPlus, FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/helpers/format';
import type { ProductResponse } from '@/types';

import useCartStore from '@/stores/useCartStore';
import { cartService } from '@/apis';

export default function ProductInfo({ product }: { product: ProductResponse }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIdx] || null;

  const price = activeVariant?.price || product.originPrice;
  const rating = product.averageRating || 0;
  const reviews = product.totalReviews || 0;
  const stock = activeVariant?.stockQuantity || 0;

  const incrementItems = useCartStore((state) => state.incrementItems);
  const syncFromServer = useCartStore((state) => state.syncFromServer);

  // Parse specs JSON để hiện highlight
  let specs: Record<string, string> = {};
  try { specs = product.specsJson ? JSON.parse(product.specsJson) : {}; } catch { /* ignore */ }
  const highlightSpecs = Object.entries(specs).slice(0, 4);

  // Group variants by type: unique colors and unique capacities
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const uniqueCapacities = [...new Set(variants.map(v => v.storageCapacity).filter(Boolean))];

  const handleAddToCart = async () => {
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
      console.warn('Lỗi thêm giỏ hàng API, có thể do chưa đăng nhập:', error);
      // Optimistic: increment locally if API fails (guest mode)
      incrementItems(quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        description: product.name,
      });
    }
  };

  const handleBuyNow = () => {
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
    <div className="w-full lg:w-7/12 flex flex-col">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>

      <div className="flex items-center gap-4 mb-6">
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
        {product.originPrice > price && (
          <span className="text-xl text-slate-400 line-through mb-1">{formatPrice(product.originPrice)}</span>
        )}
      </div>

      {/* Highlighted Specs from specsJson */}
      {highlightSpecs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {highlightSpecs.map(([key, value]) => (
            <span key={key} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Variants */}
      <div className="space-y-6 mb-8">
        {/* Variant buttons */}
        {variants.length > 1 && (
          <div>
            <h3 className="font-bold mb-3">Phiên bản</h3>
            <div className="flex flex-wrap gap-3">
              {variants.map((v, idx) => (
                <button key={v.id} onClick={() => setSelectedVariantIdx(idx)}
                  className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all ${selectedVariantIdx === idx ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}>
                  {v.variantName || v.sku}
                  <span className="block text-xs mt-0.5">{formatPrice(v.price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="pt-2">
          <h3 className="font-bold mb-3">Số lượng</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95">
                <FiMinus />
              </button>
              <input type="text" value={quantity}
                onChange={(e) => { const num = parseInt(e.target.value); if (!isNaN(num) && num > 0) setQuantity(num); }}
                className="w-16 h-10 text-center border-none bg-transparent font-bold text-lg focus:ring-0 p-0" />
              <button type="button" onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95">
                <FiPlus />
              </button>
            </div>
            <span className="text-sm text-slate-500 font-medium">{stock > 0 ? `${stock} sản phẩm có sẵn` : 'Hết hàng'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-auto">
        <button className="w-14 h-14 shrink-0 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <FiHeart className="text-2xl" />
        </button>
        <button onClick={handleAddToCart} disabled={stock === 0}
          className="flex-1 h-14 rounded-2xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <FiShoppingCart className="text-xl" /> Thêm vào giỏ
        </button>
        <button onClick={handleBuyNow} disabled={stock === 0}
          className="btn btn-primary flex-1 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          Mua ngay
        </button>
      </div>
    </div>
  );
}
