import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiClock } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import { motion } from 'motion/react';
import cartService from '@/apis/services/cartService';
import wishlistService from '@/apis/services/wishlistService';
import useCartStore from '@/stores/useCartStore';

/**
 * ProductCard linh hoạt — chấp nhận cả mock data lẫn ProductResponse từ server.
 * Tự detect và map field phù hợp.
 */
export default function ProductCard({ product }: { product: any }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });
  const [liked, setLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const syncFromServer = useCartStore((s) => s.syncFromServer);

  const productId: string = product.id || '';
  const firstVariantId: string = product.variants?.[0]?.id || '';

  // ── Normalize fields: support cả mock data lẫn ProductResponse ──
  const name: string = product.name || '';
  const slug: string = product.slug || '';

  // Image: server trả mainImageUrl, mock trả image
  const image: string = product.mainImageUrl || product.image || '';

  // Price: server trả originPrice + variants[0].price, mock trả price
  const lowestVariantPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : null;
  const price: number = lowestVariantPrice || product.price || product.originPrice || 0;
  const oldPrice: number = product.compareAtPrice || product.oldPrice || (lowestVariantPrice && product.originPrice > lowestVariantPrice ? product.originPrice : 0);
  const discount: number = product.discount || (oldPrice > 0 && price > 0 ? Math.round((1 - price / oldPrice) * 100) : 0);

  // Rating
  const rating: number = product.averageRating || product.rating || 0;
  const reviews: number = product.totalReviews || product.reviews || 0;

  // Badges
  const isNew: boolean = product.isNew ?? (product.createdAt ? (Date.now() - new Date(product.createdAt).getTime()) < 30 * 86400000 : false);
  const isFlashSale: boolean = product.isFlashSale || false;
  const sold: number = product.sold || 0;

  useEffect(() => {
    if (!isFlashSale) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlashSale]);

  // --- Tính trạng thái kho hàng ---
  const isOutOfStock = product.outOfStock === true || product.status === 'OUT_OF_STOCK';
  const isInactive = product.status === 'INACTIVE';
  const isComingSoon = product.status === 'COMING_SOON';
  
  const stock: number = isOutOfStock ? 0 : (product.stockQuantity ?? (product.variants?.reduce((acc: number, v: any) => acc + (v.stockQuantity || 0), 0)) ?? 10);

  let statusText = 'CÒN HÀNG';
  let statusBg = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
  let statusTextColor = 'text-emerald-600 dark:text-emerald-400';
  let canAddToCart = stock > 0;

  if (isInactive) {
    statusText = 'NGỪNG BÁN';
    statusBg = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    statusTextColor = 'text-slate-600 dark:text-slate-400';
    canAddToCart = false;
  } else if (isComingSoon) {
    statusText = 'SẮP VỀ';
    statusBg = 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
    statusTextColor = 'text-blue-600 dark:text-blue-400';
    canAddToCart = false;
  } else if (isOutOfStock || stock <= 0) {
    statusText = 'HẾT HÀNG';
    statusBg = 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30';
    statusTextColor = 'text-red-600 dark:text-red-400';
    canAddToCart = false;
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-slate-100 dark:border-slate-800 transition-all group relative flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wider">
            MỚI
          </span>
        )}
        {discount > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wider">
            GIẢM {discount}%
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link to={`/product/${slug}`} className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-4 cursor-pointer">
        <img 
          src={image} 
          alt={name} 
          className={`w-full h-full object-contain transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal ${!canAddToCart ? 'opacity-50' : 'group-hover:scale-110'}`}
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image'; }}
        />
        {!canAddToCart && (
          <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-slate-900/80 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl backdrop-blur-md">
              {statusText}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-1 pb-1">
        
        {/* Label bao quanh Tên */}
        <Link to={`/product/${slug}`} title={name} className="block w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors mb-3 mt-1">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
            {name}
          </h3>
          
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <FiStar className="text-yellow-500 fill-yellow-500 text-xs" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{rating.toFixed(1)}</span>
              {reviews > 0 && <span className="text-[10px] font-medium text-slate-400">({reviews} đánh giá)</span>}
            </div>
          )}
        </Link>
        
        {/* Label bao quanh Giá & Trạng thái */}
        <div className="flex items-stretch gap-2 mb-4 mt-auto">
          {/* Box Giá */}
          <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-2xl border border-purple-100 dark:border-purple-800/30 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 mb-1">Giá Ưu Đãi</span>
            <div className="flex items-end gap-1.5 flex-wrap">
              <span className="text-base font-black text-slate-800 dark:text-white leading-none">
                {formatPrice(price)}
              </span>
              {oldPrice > 0 && oldPrice !== price && (
                <span className="text-xs text-slate-400 line-through leading-none font-medium">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Box Trạng thái */}
          <div className={`shrink-0 p-3 rounded-2xl border flex flex-col items-center justify-center min-w-[80px] ${statusBg}`}>
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Tình Trạng</span>
             <span className={`text-[11px] font-black uppercase text-center ${statusTextColor}`}>
               {statusText}
             </span>
          </div>
        </div>

        {isFlashSale && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-2xl border border-red-100 dark:border-red-800/30">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-red-600 dark:text-red-400">
              <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg shadow-sm">
                <FiClock className="animate-pulse" /> {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span>Đã bán {sold}%</span>
            </div>
            <div className="w-full bg-white dark:bg-slate-900 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
                style={{ width: `${sold}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Nút hành động nổi bật ở đáy */}
        <div className="flex items-center gap-2 mt-2">
           <button 
             onClick={async (e) => {
               e.preventDefault();
               if (!productId) return;
               try {
                 if (liked) {
                   await wishlistService.remove(productId);
                   setLiked(false);
                 } else {
                   await wishlistService.add(productId);
                   setLiked(true);
                 }
               } catch { /* ignore */ }
             }}
             className={`w-12 h-12 shrink-0 border rounded-2xl flex justify-center items-center transition-all shadow-sm group ${
               liked
                 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                 : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
             }`}
             title="Yêu thích"
           >
             <FiHeart className={`text-xl group-hover:scale-110 transition-transform ${liked ? 'fill-red-500' : ''}`} />
           </button>
           
           <button 
             disabled={!canAddToCart || addingToCart}
             onClick={async (e) => {
               e.preventDefault();
               if (!firstVariantId) {
                 // No variant — navigate to product detail to choose
                 navigate(`/product/${slug}`);
                 return;
               }
               setAddingToCart(true);
               try {
                 await cartService.addToCart({ variantId: firstVariantId, quantity: 1 });
                 await syncFromServer();
                 alert(`Đã thêm ${name} vào giỏ hàng!`);
               } catch {
                 alert('Thêm giỏ hàng thất bại! Vui lòng đăng nhập.');
               } finally { setAddingToCart(false); }
             }}
             className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-purple-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
           >
             <FiShoppingCart className="text-lg group-hover:-rotate-12 transition-transform" />
             {addingToCart ? 'Đang thêm...' : (canAddToCart ? 'Thêm Giỏ Hàng' : statusText)}
           </button>
        </div>
      </div>
    </motion.div>
  );
}
