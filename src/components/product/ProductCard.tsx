import { memo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import cartService from '@/apis/services/cartService';
import useCartStore from '@/stores/useCartStore';
import useWishlistStore from '@/stores/useWishlistStore';
import useAuthStore from '@/stores/useAuthStore';
import type { TimeLeft, ProductResponse } from '@/types';
import { TYPOGRAPHY_TEXT_SIZE } from '@/constants/typographyConstants';
import { getApiErrorMessage } from '@/utils/error';

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
    <div className="mb-1.5 sm:mb-4 bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl border border-red-100 dark:border-red-800/30">
      <div className="flex items-center justify-between text-10 sm:text-sm font-semibold mb-1 sm:mb-1.5 text-red-600 dark:text-red-400">
        <span className="flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-slate-900 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-sm">
          <FiClock className="animate-pulse" /> {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span>{t('productCard.flashSaleSold', { percent: totalSold })}</span>
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

function ProductCardComponent({ product }: { product: ProductResponse }) {
  const { t } = useTranslation(['catalog', 'common']);
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const productId: string = product.id || '';
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore(
    useCallback((s) => s.items.some((item) => item.productId === productId), [productId]),
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));
  const firstVariantId: string = product.variants?.[0]?.id || '';
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
  let statusBg = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
  let statusTextColor = 'text-emerald-600 dark:text-emerald-400';
  let canAddToCart = stock > 0 && salePrice > 0;

  if (isInactive) {
    statusText = t('productCard.status.inactive', { ns: 'catalog' }).toUpperCase();
    statusBg = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    statusTextColor = 'text-slate-600 dark:text-slate-400';
    canAddToCart = false;
  } else if (isComingSoon) {
    statusText = t('productCard.status.comingSoon', { ns: 'catalog' }).toUpperCase();
    statusBg = 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
    statusTextColor = 'text-blue-600 dark:text-blue-400';
    canAddToCart = false;
  } else if (salePrice <= 0) {
    statusText = t('productCard.status.contact', { ns: 'catalog' }).toUpperCase();
    statusBg = 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30';
    statusTextColor = 'text-orange-600 dark:text-orange-400';
    canAddToCart = false;
  } else if (isOutOfStock || stock <= 0) {
    statusText = t('productCard.status.outOfStock', { ns: 'catalog' }).toUpperCase();
    statusBg = 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30';
    statusTextColor = 'text-red-600 dark:text-red-400';
    canAddToCart = false;
  }


  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-3"
    >
      {/* Badges */}
      <div className="absolute top-2 sm:top-5 left-2 sm:left-5 z-10 flex flex-col gap-1 sm:gap-2">
        {isNew && (
        <span className={`bg-blue-600 text-white ${TYPOGRAPHY_TEXT_SIZE.sm} font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm uppercase tracking-wider`}>
            {t('productCard.badges.new', { ns: 'catalog' }).toUpperCase()}
          </span>
        )}
        {discount > 0 && (
          <span className={`bg-rose-600 text-white ${TYPOGRAPHY_TEXT_SIZE.sm} font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm uppercase tracking-wider`}>
            {t('productCard.badges.discount', { ns: 'catalog', percent: discount }).toUpperCase()}
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
            <span className="bg-slate-900/80 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold uppercase tracking-widest text-9 sm:text-md shadow-xl backdrop-blur-md">
              {statusText}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-0 pb-0">

        {/* Label bao quanh Tên */}
        <Link to={`/product/${slug}`} title={name} className="block w-full bg-transparent sm:bg-slate-50 sm:dark:bg-slate-800/50 hover:bg-transparent sm:hover:bg-slate-100 sm:dark:hover:bg-slate-800 p-0 sm:p-3 rounded-none sm:rounded-2xl border-0 sm:border sm:border-slate-100 sm:dark:border-slate-800 transition-colors mb-1.5 sm:mb-3 mt-0">
          <h3 className="font-bold text-12 sm:text-lg text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
            {name}
          </h3>

          {(rating > 0 || totalSold > 0) && (
            <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              {rating > 0 && (
                <div className="inline-flex items-center gap-1.5 text-11 sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <FiStar className="shrink-0 text-11 sm:text-base text-yellow-500 fill-yellow-500" />
                  <span className="font-black text-slate-800 dark:text-slate-100">{rating.toFixed(1)}</span>
                  {reviews > 0 && (
                    <span className="text-10 sm:text-sm font-semibold text-slate-400">({reviews})</span>
                  )}
                </div>
              )}
              {totalSold > 0 && (
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800/90 px-2.5 sm:px-3 py-1 sm:py-1.5 text-11 sm:text-sm font-semibold text-slate-500 dark:text-slate-300">
                  {t('productCard.sold', {
                    ns: 'catalog',
                    count: soldLabel,
                  })}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Price & Status — same row */}
        <div className="mt-auto mb-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/40 sm:mb-4 sm:rounded-2xl sm:p-3">
          {originPrice > 0 ? (
            <>
              {/* Giá gốc */}
              <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mb-1">
                <span className={`${TYPOGRAPHY_TEXT_SIZE.md} uppercase font-bold tracking-wider text-slate-400`}>{t('productCard.originalPrice', { ns: 'catalog' })}</span>
                <span className={`text-10 sm:text-sm font-medium ${hasDiscount ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                  {formatPrice(originPrice)}
                </span>
                {hasDiscount && (
                    <span className={`${TYPOGRAPHY_TEXT_SIZE.md} rounded bg-rose-50 px-1 py-0.5 font-black text-rose-600 dark:bg-rose-900/20 dark:text-rose-300 sm:px-1.5`}>
                    -{discount}%
                  </span>
                )}
              </div>
              {/* Giá bán + trạng thái */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-14 sm:text-base font-black text-slate-800 dark:text-white leading-none">
                  {formatPrice(salePrice)}
                </span>
                <span className={`${TYPOGRAPHY_TEXT_SIZE.md} font-black uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border shrink-0 whitespace-nowrap ${statusBg} ${statusTextColor}`}>
                  {statusText}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-14 sm:text-base font-black text-slate-800 dark:text-white leading-none">
                {formatPrice(salePrice)}
              </span>
              <span className={`${TYPOGRAPHY_TEXT_SIZE.md} font-black uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg border shrink-0 whitespace-nowrap ${statusBg} ${statusTextColor}`}>
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
                toast.error(t('productCard.actions.loginWishlist', { ns: 'catalog' }));
                navigate('/login');
                return;
              }
              if (!productId) return;
              await toggleWishlist(productId);
            }}
            className={`w-9 h-9 sm:w-12 sm:h-12 shrink-0 border rounded-lg sm:rounded-2xl flex justify-center items-center transition-all shadow-sm group/heart ${liked
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
              }`}
            title={t('productCard.actions.wishlist', { ns: 'catalog' })}
          >
            <FiHeart className={`text-base sm:text-xl group-hover/heart:scale-110 transition-transform ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          <button
            disabled={!canAddToCart || addingToCart}
            onClick={async (e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                toast.error(t('productCard.actions.loginCart', { ns: 'catalog' }));
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
                toast.success(t('productCard.actions.addedToCart', { ns: 'catalog', name }));
              } catch (error) {
                toast.error(getApiErrorMessage(error, translate, 'catalog:productCard.actions.addToCartFailed'));
              } finally { setAddingToCart(false); }
            }}
            className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 text-11 font-bold text-white shadow-sm shadow-blue-950/10 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 group/cart sm:h-12 sm:rounded-2xl sm:text-md sm:gap-2"
          >
            <FiShoppingCart className="text-md sm:text-lg group-hover/cart:-rotate-12 transition-transform" />
            <span className="truncate">
              {addingToCart
                ? t('productCard.actions.adding', { ns: 'catalog' })
                : (canAddToCart ? t('productCard.actions.addToCart', { ns: 'catalog' }) : statusText)}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCardComponent);
