import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '@/apis';
import type { ProductResponse } from '@/types';

interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductResponse[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  // Debounced search suggestions from API
  const fetchSuggestions = useCallback((query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSuggestions([]); return; }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await productService.search({ keyword: query, size: 5 });
        setSuggestions(res.data?.data || []);
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  if (!banners.length) return null;

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-6">
      <div className="relative rounded-2xl overflow-hidden h-[400px] md:h-[500px] lg:h-[600px] bg-slate-900 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBanner}
            src={banners[currentBanner].image}
            alt={banners[currentBanner].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10">
          <motion.h2 
            key={`title-${currentBanner}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          >
            {banners[currentBanner].title}
          </motion.h2>
          <motion.p 
            key={`sub-${currentBanner}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-medium mb-12 drop-shadow-md"
          >
            {banners[currentBanner].subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl relative"
          >
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <FiSearch className="text-2xl" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm điện thoại, laptop, phụ kiện..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  fetchSuggestions(e.target.value);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-16 pl-14 pr-32 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg shadow-2xl transition-all"
              />
              <button 
                type="submit"
                className="btn btn-primary absolute right-2 h-12 px-6"
              >
                Tìm kiếm
              </button>
            </form>

            <AnimatePresence>
              {showSuggestions && searchQuery && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left z-50"
                >
                  {suggestions.map((product) => (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.slug}`}
                      className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-none"
                    >
                      <img src={product.mainImageUrl || ''} alt={product.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{product.name}</h4>
                        <p className="text-sm text-purple-600 font-bold">
                          {(product.variants?.[0]?.price || product.originPrice || 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20">
          <FiChevronLeft className="text-2xl" />
        </button>
        <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20">
          <FiChevronRight className="text-2xl" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBanner ? 'bg-white w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
