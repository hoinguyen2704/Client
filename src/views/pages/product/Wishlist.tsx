import { useState } from 'react';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { mockProducts, formatPrice } from '@/utils/mockData';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(mockProducts.slice(0, 4));

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
          <FiHeart className="text-2xl" />
        </div>
        <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
      </div>

      {wishlist.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-40 h-40 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <FiHeart className="text-6xl text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            Hãy thêm những sản phẩm bạn yêu thích vào danh sách để dễ dàng mua sắm sau này.
          </p>
          <Link 
            to="/"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {wishlist.map(product => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-slate-100 dark:border-slate-800 transition-all group relative flex flex-col h-full"
              >
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                >
                  <FiHeart className="fill-current" />
                </button>

                <Link to={`/product/${product.id}`} className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>

                <div className="flex flex-col flex-1">
                  <Link to={`/product/${product.id}`} className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {product.name}
                  </Link>
                  
                  <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <button className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                      <FiShoppingCart /> Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
