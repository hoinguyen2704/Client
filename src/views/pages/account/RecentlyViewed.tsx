import { useState, useEffect } from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components';
import { formatDateShort as formatDate, formatPrice } from '@/utils/format';
import { clearRecentlyViewed, getRecentlyViewed, type RecentlyViewedItem } from '@/utils/recentlyViewed';

export default function RecentlyViewed() {
  const [viewedProducts, setViewedProducts] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => { setViewedProducts(getRecentlyViewed()); }, []);

  const clearHistory = () => {
    clearRecentlyViewed();
    setViewedProducts([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Sản phẩm đã xem</h1>
        {viewedProducts.length > 0 && (
          <button onClick={clearHistory}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-md">
            <FiTrash2 /> Xóa lịch sử
          </button>
        )}
      </div>

      {viewedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {viewedProducts.map(product => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
                <Link to={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><FiClock className="text-4xl" /></div>
                    )}
                    <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <FiClock /> {formatDate(product.viewedAt)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">{product.name}</h3>
                    <span className="text-lg font-bold text-purple-600">{formatPrice(product.price)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <EmptyState
            icon={<FiClock />}
            title="Chưa có sản phẩm nào"
            description="Bạn chưa xem sản phẩm nào gần đây."
          />
        </div>
      )}
    </div>
  );
}
