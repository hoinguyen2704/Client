import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiClock } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import { motion } from 'motion/react';
import type { ProductCardProps } from './types';

export default function ProductCard({ product }: ProductCardProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    if (!product.isFlashSale) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [product.isFlashSale]);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-slate-100 dark:border-slate-800 transition-all group relative flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            MỚI
          </span>
        )}
        {product.discount > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 flex items-center justify-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-slate-900 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors shadow-lg">
            <FiHeart />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-slate-900 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors shadow-lg">
            <FiShoppingCart />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          {product.name}
        </Link>
        
        <div className="flex items-center gap-1 mb-3">
          <FiStar className="text-yellow-400 fill-yellow-400 text-sm" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">({product.reviews})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-end gap-2">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-slate-400 line-through mb-0.5">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          
          {product.isFlashSale && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 text-red-500">
                  <FiClock /> {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span>Đã bán {product.sold}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
                  style={{ width: `${product.sold}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
