import { useEffect } from "react";
import {
  FiHeart,
  FiTrash2,
  FiShoppingCart,
  FiArrowRight,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "@/utils/format";
import { motion, AnimatePresence } from "motion/react";
import useWishlistStore from "@/stores/useWishlistStore";

export default function Wishlist() {
  const { t } = useTranslation(["catalog", "common"]);
  const items = useWishlistStore((s) => s.items);
  const loading = useWishlistStore((s) => s.loading);
  const syncFromServer = useWishlistStore((s) => s.syncFromServer);
  const toggleItem = useWishlistStore((s) => s.toggleItem);

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  const handleRemove = async (productSlug: string) => {
    await toggleItem(productSlug);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 md:py-12 space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
        <div className="mb-1 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-md font-bold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 sm:mb-2 sm:px-4 sm:py-2 sm:text-base">
          <FiHeart className="text-xl" />
          <span>{t("wishlistPage.summary", { count: items.length })}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {t("wishlistPage.title")}
        </h1>
        <p className="text-md sm:text-base text-muted">
          {t("wishlistPage.description")}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 sm:h-72 bg-slate-200 dark:bg-slate-700/50 rounded-2xl sm:rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/70 p-6 text-center shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50 sm:rounded-[2.5rem] sm:p-12"
        >
          {/* Abstract background blobs for empty state */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-blue-500/10 blur-[60px]" />

          <div className="relative z-10">
            <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-8 relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-full animate-ping opacity-75" />
              <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-700 shadow-md">
                <FiHeart className="text-4xl sm:text-5xl text-red-500" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-body">
              {t("wishlistPage.empty.title")}
            </h3>
            <p className="text-md sm:text-base text-muted max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
              {t("wishlistPage.empty.description")}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-md font-bold text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-blue-700 sm:px-8 sm:py-4 sm:text-base"
            >
              <FiShoppingCart className="text-xl" />{" "}
              {t("wishlistPage.empty.action")}
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
          <AnimatePresence>
            {items.map((item) => {
              const discount = calculateDiscount(
                item.productPrice,
                item.productCompareAtPrice,
              );

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/8 dark:border-slate-800 dark:bg-slate-900 sm:rounded-[2rem]"
                >
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800"
                  >
                    {discount > 0 && (
                      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500 text-white text-10 sm:text-sm font-black rounded-lg sm:rounded-xl shadow-lg shadow-red-500/30">
                        -{discount}%
                      </div>
                    )}

                    {item.productThumbnailUrl ? (
                      <img
                        src={item.productThumbnailUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-subtle gap-3">
                        <FiShoppingCart className="text-5xl opacity-50" />
                        <span className="text-md font-medium">{t("common:labels.noImage")}</span>
                      </div>
                    )}

                    {/* Hover overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Link>

                  <div className="p-3 sm:p-5 flex flex-col flex-1">
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="mb-2 line-clamp-2 text-md font-bold leading-snug transition-colors hover:text-blue-700 dark:hover:text-blue-300 sm:mb-3 sm:text-lg"
                    >
                      {item.productName}
                    </Link>

                    <div className="mt-auto">
                      <div className="flex flex-col gap-0.5 sm:gap-1 mb-3 sm:mb-5">
                        <span className="w-max text-base font-extrabold text-ink sm:text-xl">
                          {formatPrice(item.productPrice)}
                        </span>
                        {discount > 0 && (
                          <span className="text-sm sm:text-md text-subtle line-through font-medium">
                            {formatPrice(item.productCompareAtPrice!)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemove(item.productSlug)}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-red-100 dark:border-red-900/40 text-red-500 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-900/20 dark:hover:border-red-500 transition-all flex items-center justify-center shrink-0 group/btn"
                          aria-label={t("wishlistPage.actions.remove")}
                        >
                          <FiTrash2 className="text-base sm:text-lg group-hover/btn:scale-110 transition-transform" />
                        </button>

                        <Link
                          to={`/product/${item.productSlug}`}
                          className="group/link flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-sm font-bold text-body transition-all hover:bg-blue-600 hover:text-white dark:bg-slate-800 sm:h-12 sm:rounded-2xl sm:gap-2 sm:text-base"
                        >
                          {t("wishlistPage.actions.buyOptions")}{" "}
                          <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
