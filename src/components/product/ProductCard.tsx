import { memo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiClock } from 'react-icons/fi';
import { formatPrice } from '@/utils/format';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import cartService from '@/apis/services/cartService';
import useCartStore from '@/stores/useCartStore';
import useWishlistStore from '@/stores/useWishlistStore';
import useAuthStore from '@/stores/useAuthStore';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const INITIAL_FLASH_TIME: TimeLeft = { hours: 2, minutes: 45, seconds: 12 };

function FlashSaleCountdown({ totalSold }: { totalSold: number }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(INITIAL_FLASH_TIME);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-1.5 sm:mb-4 bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl border border-red-100 dark:border-red-800/30">
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 text-red-600 dark:text-red-400">
        <span className="flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-slate-900 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-sm">
          <FiClock className="animate-pulse" /> {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span>Đã bán {totalSold}%</span>
      </div>
      <div className="w-full bg-white dark:bg-slate-900 rounded-full h-1.5 sm:h-2 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
          style={{ width: `${totalSold}%` }}
        ></div>
      </div>
    </div>
  );
}

function ProductCardComponent({ product }: { product: any }) {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const productId: string = product.id || '';
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore(
    useCallback((s) => s.items.some((item) => item.productId === productId), [productId]),
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const firstVariantId: string = product.variants?.[0]?.id || '';
  const name: string = product.name || '';
  const slug: string = product.slug || '';
  const image: string = product.mainImageUrl || product.image || '';
  const lowestVariantPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : null;
  const salePrice: number = product.lowestPrice || lowestVariantPrice || product.price || product.originPrice || 0;
  const originPrice: number = product.originPrice || product.compareAtPrice || product.oldPrice || 0;
  const hasDiscount = originPrice > 0 && salePrice > 0 && originPrice > salePrice;
  const discount: number = product.discount || (hasDiscount ? Math.round((1 - salePrice / originPrice) * 100) : 0);

  // Rating
  const rating: number = product.averageRating || product.rating || 0;
  const reviews: number = product.totalReviews || product.reviews || 0;

  // Badges
  const isNew: boolean = product.isNew ?? (product.createdAt ? (Date.now() - new Date(product.createdAt).getTime()) < 30 * 86400000 : false);
  const isFlashSale: boolean = product.isFlashSale || false;
  const totalSold: number = product.totalSold || product.sold || 0;

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
      className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-3xl p-1.5 sm:p-3 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-slate-100 dark:border-slate-800 transition-all group relative flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-2 sm:top-5 left-2 sm:left-5 z-10 flex flex-col gap-1 sm:gap-2">
        {isNew && (
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm uppercase tracking-wider">
            MỚI
          </span>
        )}
        {discount > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm uppercase tracking-wider">
            GIẢM {discount}%
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link to={`/product/${slug}`} className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden mb-1.5 sm:mb-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2 sm:p-4 cursor-pointer">
        <img 
          src={image} 
          alt={name} 
          className={`w-full h-full object-contain transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal ${!canAddToCart ? 'opacity-50' : 'group-hover:scale-110'}`}
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image'; }}
        />
        {!canAddToCart && (
          <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-slate-900/80 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold uppercase tracking-widest text-[9px] sm:text-sm shadow-xl backdrop-blur-md">
              {statusText}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-0 pb-0">
        
        {/* Label bao quanh Tên */}
        <Link to={`/product/${slug}`} title={name} className="block w-full bg-transparent sm:bg-slate-50 sm:dark:bg-slate-800/50 hover:bg-transparent sm:hover:bg-slate-100 sm:dark:hover:bg-slate-800 p-0 sm:p-3 rounded-none sm:rounded-2xl border-0 sm:border sm:border-slate-100 sm:dark:border-slate-800 transition-colors mb-1.5 sm:mb-3 mt-0">
          <h3 className="font-bold text-[12px] sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
            {name}
          </h3>
          
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-1 sm:mt-2">
              <FiStar className="text-yellow-500 fill-yellow-500 text-[10px] sm:text-xs" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">{rating.toFixed(1)}</span>
              {reviews > 0 && <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">({reviews})</span>}
            </div>
          )}
          {totalSold > 0 && (
            <span className={`text-[9px] sm:text-[10px] font-medium text-slate-400 ${rating > 0 ? 'ml-0.5' : 'mt-1 sm:mt-2 block'}`}>
              {rating > 0 && '· '}Đã bán {totalSold > 999 ? `${(totalSold / 1000).toFixed(1)}k` : totalSold}
            </span>
          )}
        </Link>
        
        {/* Price & Status — same row */}
        <div className="bg-slate-50 dark:bg-slate-800/40 sm:bg-gradient-to-br sm:from-purple-50 sm:to-blue-50 sm:dark:from-purple-900/20 sm:dark:to-blue-900/20 p-2 sm:p-3 rounded-lg sm:rounded-2xl border border-slate-100 sm:border-purple-100 dark:border-slate-700 sm:dark:border-purple-800/30 mb-1.5 sm:mb-4 mt-auto">
          {originPrice > 0 ? (
            <>
              {/* Giá gốc */}
              <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mb-1">
                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">Giá gốc</span>
                <span className={`text-[10px] sm:text-xs font-medium ${hasDiscount ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                  {formatPrice(originPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-[8px] sm:text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-1 sm:px-1.5 py-0.5 rounded">
                    -{discount}%
                  </span>
                )}
              </div>
              {/* Giá bán + trạng thái */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[14px] sm:text-base font-black text-slate-800 dark:text-white leading-none">
                  {formatPrice(salePrice)}
                </span>
                <span className={`text-[8px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border shrink-0 whitespace-nowrap ${statusBg} ${statusTextColor}`}>
                  {statusText}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[14px] sm:text-base font-black text-slate-800 dark:text-white leading-none">
                {formatPrice(salePrice)}
              </span>
              <span className={`text-[8px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border shrink-0 whitespace-nowrap ${statusBg} ${statusTextColor}`}>
                {statusText}
              </span>
            </div>
          )}
        </div>

        {isFlashSale && <FlashSaleCountdown totalSold={totalSold} />}

        {/* Nút hành động nổi bật ở đáy */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
           <button 
             onClick={async (e) => {
               e.preventDefault();
               if (!isAuthenticated) {
                 toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
                 navigate('/login');
                 return;
               }
               if (!productId) return;
               await toggleWishlist(productId);
             }}
             className={`w-9 h-9 sm:w-12 sm:h-12 shrink-0 border rounded-lg sm:rounded-2xl flex justify-center items-center transition-all shadow-sm group/heart ${
               liked
                 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                 : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
             }`}
             title="Yêu thích"
           >
             <FiHeart className={`text-base sm:text-xl group-hover/heart:scale-110 transition-transform ${liked ? 'fill-red-500 text-red-500' : ''}`} />
           </button>
           
           <button 
             disabled={!canAddToCart || addingToCart}
             onClick={async (e) => {
               e.preventDefault();
               if (!isAuthenticated) {
                 toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
                 navigate('/login');
                 return;
               }
               if (!firstVariantId) {
                 // No variant — navigate to product detail to choose
                 navigate(`/product/${slug}`);
                 return;
               }
               setAddingToCart(true);
               try {
                  await cartService.addToCart({ variantId: firstVariantId, quantity: 1 });
                  await syncFromServer();
                  toast.success(`Đã thêm ${name} vào giỏ hàng!`);
                } catch {
                  toast.error('Thêm giỏ hàng thất bại! Vui lòng đăng nhập.');
               } finally { setAddingToCart(false); }
             }}
             className="flex-1 h-9 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg sm:rounded-2xl font-bold text-[11px] sm:text-sm flex justify-center items-center gap-1 sm:gap-2 transition-all shadow-lg shadow-purple-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group/cart"
           >
             <FiShoppingCart className="text-sm sm:text-lg group-hover/cart:-rotate-12 transition-transform" />
             <span className="truncate">
               {addingToCart ? 'Đang thêm...' : (canAddToCart ? 'Thêm Giỏ Hàng' : statusText)}
             </span>
           </button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCardComponent);
