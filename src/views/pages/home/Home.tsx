import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiChevronLeft, FiChevronRight, FiZap, FiTrendingUp, FiStar, FiSearch, FiCpu } from 'react-icons/fi';
import { mockProducts } from '@/utils/mockData';
import ProductCard from '@/components/ui/ProductCard';
import { Link, useNavigate } from 'react-router-dom';

const banners = [
  { id: 1, image: 'https://picsum.photos/seed/banner1/1200/400', title: 'Siêu Sale Công Nghệ', subtitle: 'Giảm đến 50%' },
  { id: 2, image: 'https://picsum.photos/seed/banner2/1200/400', title: 'Laptop Gaming Mới', subtitle: 'Tặng kèm balo & chuột' },
  { id: 3, image: 'https://picsum.photos/seed/banner3/1200/400', title: 'Apple Week', subtitle: 'Ưu đãi độc quyền' },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const flashSaleProducts = mockProducts.filter(p => p.isFlashSale);
  const bestSellers = mockProducts.sort((a, b) => b.sold - a.sold).slice(0, 4);
  const newArrivals = mockProducts.filter(p => p.isNew);
  const aiRecommended = mockProducts.slice(2, 7); // Mock AI recommendations

  const searchSuggestions = mockProducts
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="pb-20">
      {/* Hero Banner */}
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
            
            {/* Hero Search Bar */}
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
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full h-16 pl-14 pr-32 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg shadow-2xl transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Tìm kiếm
                </button>
              </form>

              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && searchQuery && searchSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left z-50"
                  >
                    {searchSuggestions.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-none"
                      >
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{product.name}</h4>
                          <p className="text-sm text-purple-600 font-bold">{product.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Navigation */}
          <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20">
            <FiChevronLeft className="text-2xl" />
          </button>
          <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20">
            <FiChevronRight className="text-2xl" />
          </button>

          {/* Indicators */}
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

      {/* AI Recommend */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <FiCpu className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Gợi ý cho bạn</h2>
              <p className="text-sm text-slate-500 mt-1">Dựa trên lịch sử xem của bạn</p>
            </div>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 md:gap-6 snap-x custom-scrollbar">
          {aiRecommended.map(product => (
            <div key={product.id} className="min-w-[240px] md:min-w-[280px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
              <FiZap className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Flash Sale</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">Kết thúc trong:</span>
                <div className="flex gap-1 text-sm font-bold">
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md">02</span>:
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md">45</span>:
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md">12</span>
                </div>
              </div>
            </div>
          </div>
          <Link to="/flash-sale" className="text-purple-600 font-medium hover:underline">Xem tất cả</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {flashSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl my-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <FiTrendingUp className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold">Bán chạy nhất</h2>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 md:gap-6 snap-x">
          {bestSellers.map(product => (
            <div key={product.id} className="min-w-[240px] md:min-w-[280px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FiStar className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold">Hàng mới về</h2>
          </div>
          <Link to="/search" className="text-purple-600 font-medium hover:underline">Xem tất cả</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
