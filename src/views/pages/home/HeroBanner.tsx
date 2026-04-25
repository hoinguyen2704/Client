import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '@/apis';
import { formatPrice } from '@/utils/format';
import type { ProductResponse, Banner } from '@/types';



interface HeroBannerProps {
  banners: Banner[];
}

// Isolated search bar — NOT affected by banner rotation re-renders
const HeroSearchBar = memo(function HeroSearchBar() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductResponse[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl relative"
    >
      <form 
        onSubmit={handleSearch} 
        className="relative flex items-center w-full rounded-full border border-white/50 bg-white/95 p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 focus-within:ring-4 focus-within:ring-blue-500/15 dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-[0_18px_40px_rgba(15,23,42,0.34)]"
      >
        <div className="pl-5 text-subtle">
          <FiSearch className="text-2xl" />
        </div>
        <input
          type="text"
          placeholder={t('hero.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
            fetchSuggestions(e.target.value);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full h-14 bg-transparent border-none outline-none pl-4 pr-4 text-ink placeholder-slate-400 text-lg"
        />
        <button 
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 font-semibold text-white shadow-sm shadow-blue-950/15 transition-all hover:bg-blue-700 active:scale-95"
        >
          {t('hero.searchButton')}
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
                  <h4 className="font-medium text-ink line-clamp-1">{product.name}</h4>
                  <p className="text-md font-bold text-ink">
                    {formatPrice(product.variants?.[0]?.price || product.originPrice || 0)}
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  if (!banners.length) return null;

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-6">
      <div className="group relative h-[400px] overflow-hidden rounded-[2rem] bg-slate-950 md:h-[500px] lg:h-[600px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBanner}
            src={banners[currentBanner].image}
            alt={banners[currentBanner].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.78, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(15,23,42,0.22),rgba(15,23,42,0.48))]" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-white">
          <motion.h2 
            key={`title-${currentBanner}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 max-w-4xl text-4xl font-bold tracking-tight drop-shadow-lg md:text-6xl"
          >
            {banners[currentBanner].title}
          </motion.h2>
          <motion.p 
            key={`sub-${currentBanner}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-12 max-w-3xl text-xl font-medium text-white/90 drop-shadow-md md:text-2xl"
          >
            {banners[currentBanner].subtitle}
          </motion.p>
          
          {/* Search bar isolated — NOT re-rendered on banner change */}
          <HeroSearchBar />
        </div>

        <button onClick={prevBanner} className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/35 text-white backdrop-blur-md transition-colors hover:bg-slate-900/55">
          <FiChevronLeft className="text-2xl" />
        </button>
        <button onClick={nextBanner} className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/35 text-white backdrop-blur-md transition-colors hover:bg-slate-900/55">
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
