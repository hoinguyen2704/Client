import { memo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import useWishlistStore from '@/stores/useWishlistStore';
import useAuthStore from '@/stores/useAuthStore';
import type { TimeLeft, ProductResponse } from '@/types';
import { TYPOGRAPHY_TEXT_SIZE } from '@/constants/typographyConstants';

const INITIAL_FLASH_TIME: TimeLeft = { hours: 2, minutes: 45, seconds: 12 };

function FlashSaleCountdown({ totalSold }: { totalSold: number }) {
  const { t } = useTranslation('catalog');
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
    <div className="mb-1.5 rounded-lg border border-red-100 bg-red-50/80 px-2 py-1 dark:border-red-800/30 dark:bg-red-900/10 sm:mb-2 sm:rounded-xl sm:px-2.5">
      <div className="mb-1 flex items-center justify-between text-10 sm:text-xs font-semibold text-red-600 dark:text-red-400">
        <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md shadow-sm dark:bg-slate-900">
          <FiClock className="animate-pulse" /> {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="truncate pl-2">{t('productCard.flashSaleSold', { percent: totalSold })}</span>
      </div>
      <div className="w-full bg-white dark:bg-slate-900 rounded-full h-1.5 overflow-hidden shadow-inner sm:h-2">
        <div
          className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
          style={{ width: `${totalSold}%` }}
        ></div>
      </div>
    </div>
  );
}

function ProductCardComponent({ product }: { product: ProductResponse }) {
  const { t } = useTranslation(['catalog', 'common']);
  const navigate = useNavigate();
  const productId: string = product.id || '';
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore(
    useCallback((s) => s.items.some((item) => item.productId === productId), [productId]),
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const name: string = product.name || '';
  const slug: string = product.slug || '';
  const image: string = product.mainImageUrl || product.image || 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image';
  const lowestVariantPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
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
  const soldLabel = totalSold > 999 ? `${(totalSold / 1000).toFixed(1)}k` : totalSold;

  // --- Tính trạng thái kho hàng ---
  const isOutOfStock = product.outOfStock === true || product.status === 'OUT_OF_STOCK';
  const isInactive = product.status === 'INACTIVE';
  const isComingSoon = product.status === 'COMING_SOON';

  const stock: number = isOutOfStock ? 0 : (product.stockQuantity ?? (product.variants?.reduce((acc: number, v) => acc + (v.stockQuantity || 0), 0)) ?? 10);

  let statusText = t('productCard.status.available', { ns: 'catalog' }).toUpperCase();
  let isPurchasable = stock > 0 && salePrice > 0;

  if (isInactive) {
    statusText = t('productCard.status.inactive', { ns: 'catalog' }).toUpperCase();
    isPurchasable = false;
  } else if (isComingSoon) {
    statusText = t('productCard.status.comingSoon', { ns: 'catalog' }).toUpperCase();
    isPurchasable = false;
  } else if (salePrice <= 0) {
    statusText = t('productCard.status.contact', { ns: 'catalog' }).toUpperCase();
    isPurchasable = false;
  } else if (isOutOfStock || stock <= 0) {
    statusText = t('productCard.status.outOfStock', { ns: 'catalog' }).toUpperCase();
    isPurchasable = false;
  }


  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative mx-auto flex h-full w-full max-w-[23rem] flex-col rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_32px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 sm:rounded-[26px] sm:p-2.5"
    >
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-4 sm:top-4 sm:gap-1.5">
        {isNew && (
        <span className={`bg-blue-600 text-white ${TYPOGRAPHY_TEXT_SIZE.sm} font-black px-1.5 sm:px-2 py-0.5 sm:py-0.5 rounded-md sm:rounded-lg shadow-sm uppercase tracking-wider`}>
            {t('productCard.badges.new', { ns: 'catalog' }).toUpperCase()}
          </span>
        )}
        {discount > 0 && (
          <span className={`bg-rose-600 text-white ${TYPOGRAPHY_TEXT_SIZE.sm} font-black px-1.5 sm:px-2 py-0.5 sm:py-0.5 rounded-md sm:rounded-lg shadow-sm uppercase tracking-wider`}>
            {t('productCard.badges.discount', { ns: 'catalog', percent: discount }).toUpperCase()}
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link to={`/product/${slug}`} className="relative aspect-[4/3.15] rounded-lg sm:rounded-[20px] overflow-hidden mb-1.5 sm:mb-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1 sm:p-2 cursor-pointer">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-contain transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal ${!isPurchasable ? 'opacity-50' : 'group-hover:scale-110'}`}
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image'; }}
        />
        {!isPurchasable && (
          <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-slate-900/80 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold uppercase tracking-widest text-9 sm:text-md shadow-xl backdrop-blur-md">
              {statusText}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-0.5 pb-0 sm:px-0">

        <Link to={`/product/${slug}`} title={name} className="block w-full transition-colors mb-1.5 sm:mb-2 mt-0">
          <h3 className="min-h-[2.8rem] font-bold text-12 sm:min-h-[3.15rem] sm:text-[15px] text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
            {name}
          </h3>
        </Link>

        {(rating > 0 || totalSold > 0) && (
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 sm:mb-2">
            {rating > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-11 font-semibold text-amber-700 shadow-sm shadow-amber-500/10 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300 sm:text-xs">
                <FiStar className="shrink-0 text-11 text-amber-500 fill-amber-500 sm:text-sm" />
                <span className="text-[13px] font-black leading-none tracking-tight text-slate-900 dark:text-white sm:text-sm">
                  {rating.toFixed(1)}
                </span>
                {reviews > 0 && (
                  <span className="text-10 font-bold text-amber-700/80 dark:text-amber-300/80 sm:text-xs">
                    ({reviews})
                  </span>
                )}
              </div>
            )}
            {totalSold > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 text-11 sm:text-xs font-semibold text-slate-500 dark:text-slate-300">
                {t('productCard.sold', {
                  ns: 'catalog',
                  count: soldLabel,
                })}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto border-t border-slate-100 pt-1.5 dark:border-slate-800 sm:pt-2">
          {originPrice > 0 && (
            <div className="mb-1 flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
              <span className={`text-10 sm:text-xs font-medium ${hasDiscount ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                {formatPrice(originPrice)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="text-13 sm:text-[15px] font-black text-slate-800 dark:text-white leading-none">
                {formatPrice(salePrice)}
              </span>
              {hasDiscount && (
                <span className={`${TYPOGRAPHY_TEXT_SIZE.md} rounded bg-rose-50 px-1 py-0.5 font-black text-rose-600 dark:bg-rose-900/20 dark:text-rose-300 sm:px-1.5`}>
                  -{discount}%
                </span>
              )}
            </div>

            <button
              onClick={async (e) => {
                e.preventDefault();
                if (!isAuthenticated) {
                  toast.error(t('productCard.actions.loginWishlist', { ns: 'catalog' }));
                  navigate('/login');
                  return;
                }
                if (!productId) return;
                await toggleWishlist(productId);
              }}
              className={`h-9 w-9 shrink-0 border rounded-lg flex justify-center items-center transition-all shadow-sm group/heart sm:h-10 sm:w-10 sm:rounded-xl ${liked
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                }`}
              title={t('productCard.actions.wishlist', { ns: 'catalog' })}
            >
              <FiHeart className={`text-base sm:text-xl group-hover/heart:scale-110 transition-transform ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {isFlashSale && <FlashSaleCountdown totalSold={totalSold} />}
      </div>
    </motion.div>
  );
}

export default memo(ProductCardComponent);
