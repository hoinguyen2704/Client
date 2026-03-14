import { useState } from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '@/components/ui/ProductCard';
import { mockProducts } from '@/utils/mockData';

export default function RecentlyViewed() {
  // Mocking recently viewed by taking the first 6 products and adding a timestamp
  const initialViewed = mockProducts.slice(0, 6).map((p, index) => ({
    ...p,
    viewedAt: new Date(Date.now() - index * 3600000).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
    })
  }));

  const [viewedProducts, setViewedProducts] = useState(initialViewed);

  const clearHistory = () => {
    setViewedProducts([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Sản phẩm đã xem</h1>
        {viewedProducts.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
          >
            <FiTrash2 /> Xóa lịch sử
          </button>
        )}
      </div>

      {viewedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {viewedProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <FiClock /> {product.viewedAt}
                </div>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-4xl">
            <FiClock />
          </div>
          <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-slate-500 mb-6">Bạn chưa xem sản phẩm nào gần đây.</p>
        </div>
      )}
    </div>
  );
}
