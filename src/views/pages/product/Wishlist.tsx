import { useState, useEffect } from "react";
import {
  FiHeart,
  FiTrash2,
  FiShoppingCart,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatPrice } from "@/helpers/format";
import { toast } from "sonner";
import wishlistService from "@/apis/services/wishlistService";
import type { WishlistResponse } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import useWishlistStore from "@/stores/useWishlistStore";

export default function Wishlist() {
  const { items, loading, syncFromServer, toggleItem } = useWishlistStore();

  useEffect(() => {
    // If the items are empty and not loading, give it a sync attempt just in case
    // Header hasn't finished its global sync yet.
    if (items.length === 0) {
      syncFromServer();
    }
  }, []);

  const handleRemove = async (productId: string) => {
    await toggleItem(productId);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold rounded-2xl shadow-sm border border-purple-100 dark:border-purple-800 mb-2">
          <FiHeart className="text-xl" />
          <span>{items.length} sản phẩm</span>
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Danh sách Yêu thích
        </h1>
        <p className="text-slate-500">Lưu trữ những thiết bị công nghệ bạn đang để mắt tới</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-slate-200 dark:bg-slate-700/50 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl shadow-purple-500/5"
        >
          {/* Abstract background blobs for empty state */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full" />

          <div className="relative z-10">
            <div className="w-28 h-28 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-full animate-ping opacity-75" />
              <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-700 shadow-md">
                <FiHeart className="text-5xl text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
              Trái tim bạn đang trống trải!
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy tiếp tục
              khám phá và lưu lại những món đồ công nghệ ưa thích để mua sau
              nhé.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all"
            >
              <FiShoppingCart className="text-xl" /> Khám phá ngay
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group flex flex-col"
                >
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800"
                  >
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/30">
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
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                        <FiShoppingCart className="text-5xl opacity-50" />
                        <span className="text-sm font-medium">No Image</span>
                      </div>
                    )}

                    {/* Hover overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="font-bold text-lg line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-3 leading-snug"
                    >
                      {item.productName}
                    </Link>

                    <div className="mt-auto">
                      <div className="flex flex-col gap-1 mb-5">
                        <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent w-max">
                          {formatPrice(item.productPrice)}
                        </span>
                        {discount > 0 && (
                          <span className="text-sm text-slate-400 line-through font-medium">
                            {formatPrice(item.productCompareAtPrice!)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="w-12 h-12 rounded-2xl border-2 border-red-100 dark:border-red-900/40 text-red-500 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-900/20 dark:hover:border-red-500 transition-all flex items-center justify-center shrink-0 group/btn"
                          aria-label="Remove from wishlist"
                        >
                          <FiTrash2 className="text-lg group-hover/btn:scale-110 transition-transform" />
                        </button>

                        <Link
                          to={`/product/${item.productSlug}`}
                          className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 group/link"
                        >
                          Tùy chọn mua{" "}
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
