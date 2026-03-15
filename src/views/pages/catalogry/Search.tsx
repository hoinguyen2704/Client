import { useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiX, FiChevronLeft, FiChevronRight, FiSearch, FiCheck } from 'react-icons/fi';
import { AnimatePresence } from 'motion/react';
import { mockProducts } from '@/utils/mockData';
import ProductCard from '@/components/ui/ProductCard';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

const categories = [
  { id: 'all', label: 'Tất cả danh mục' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'smartphone', label: 'Điện thoại' },
  { id: 'tablet', label: 'Máy tính bảng' },
  { id: 'accessory', label: 'Phụ kiện' },
];

const brandsByCategory: Record<string, string[]> = {
  all: ['Apple', 'Samsung', 'ASUS', 'Sony', 'LG', 'Keychron', 'Dell', 'HP', 'Lenovo', 'Xiaomi', 'OPPO', 'Logitech'],
  laptop: ['Apple', 'ASUS', 'Dell', 'HP', 'Lenovo'],
  smartphone: ['Apple', 'Samsung', 'Xiaomi', 'OPPO'],
  tablet: ['Apple', 'Samsung', 'Lenovo'],
  accessory: ['Sony', 'LG', 'Keychron', 'Logitech', 'Apple', 'Samsung'],
};

const filterConfigs: Record<string, { id: string, label: string, options: string[] }[]> = {
  all: [],
  laptop: [
    { id: 'cpu', label: 'CPU', options: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1/M2/M3'] },
    { id: 'ram', label: 'RAM', options: ['8GB', '16GB', '32GB', '64GB'] },
    { id: 'storage', label: 'Ổ cứng', options: ['256GB', '512GB', '1TB', '2TB'] },
    { id: 'screen', label: 'Màn hình', options: ['13.3"', '14"', '15.6"', '16"'] },
  ],
  smartphone: [
    { id: 'ram', label: 'RAM', options: ['4GB', '8GB', '12GB', '16GB'] },
    { id: 'storage', label: 'Bộ nhớ trong', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
  ],
  tablet: [
    { id: 'ram', label: 'RAM', options: ['4GB', '8GB', '16GB'] },
    { id: 'storage', label: 'Bộ nhớ trong', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
    { id: 'screen', label: 'Màn hình', options: ['8"', '10.2"', '11"', '12.9"'] },
  ],
  accessory: [
    { id: 'type', label: 'Loại phụ kiện', options: ['Bàn phím', 'Chuột', 'Tai nghe', 'Cáp sạc', 'Ốp lưng'] },
    { id: 'connection', label: 'Kết nối', options: ['Có dây', 'Không dây (Bluetooth)', 'Wireless 2.4GHz'] },
  ],
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('newest');

  const toggleFilter = (state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (state.includes(value)) {
      setState(state.filter(v => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedBrands([]);
    setDynamicFilters({});
  };

  const toggleDynamicFilter = (filterId: string, value: string) => {
    setDynamicFilters(prev => {
      const current = prev[filterId] || [];
      if (current.includes(value)) {
        return { ...prev, [filterId]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [filterId]: [...current, value] };
      }
    });
  };

  // Mock filtering logic
  let filteredProducts = mockProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.brand.toLowerCase().includes(lowerQuery));
  }

  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => {
      const name = p.name.toLowerCase();
      if (selectedCategory === 'laptop') return name.includes('macbook') || name.includes('laptop') || name.includes('asus');
      if (selectedCategory === 'smartphone') return name.includes('iphone') || name.includes('samsung') || name.includes('điện thoại');
      if (selectedCategory === 'tablet') return name.includes('ipad') || name.includes('tab');
      if (selectedCategory === 'accessory') return name.includes('tai nghe') || name.includes('bàn phím') || name.includes('chuột');
      return true;
    });
  }

  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedBrands.includes(p.brand));
  }
  
  // Mock sorting logic
  if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === 'best-selling') filteredProducts.sort((a, b) => b.sold - a.sold);
  if (sortBy === 'newest') filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-purple-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><span className="text-slate-900 dark:text-slate-100 font-medium">Tìm kiếm sản phẩm</span></li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 font-medium"
          onClick={() => setIsFilterOpen(true)}
        >
          <FiFilter /> Lọc sản phẩm
        </button>

        {/* Sidebar Filters */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto p-6 lg:p-0 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <FiX />
              </button>
            </div>

            <div className="space-y-8 pb-8">
              {/* Category */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Danh mục sản phẩm</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${selectedCategory === cat.id ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Khoảng giá</h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100000000" 
                    step="1000000"
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex items-center gap-2">
                    <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])} className="w-full h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm" />
                    <span>-</span>
                    <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm" />
                  </div>
                </div>
              </div>

              {/* Brands */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`brands-${selectedCategory}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <h3 className="font-bold mb-4 text-lg">Thương hiệu</h3>
                  <div className="space-y-3">
                    {brandsByCategory[selectedCategory].map((brand, i) => (
                      <motion.label
                        key={brand}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                            className="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:border-purple-600 checked:bg-purple-600 dark:checked:border-purple-500 dark:checked:bg-purple-500 transition-colors cursor-pointer"
                          />
                          <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-sm" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{brand}</span>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dynamic Filters */}
              <AnimatePresence mode="wait">
                {filterConfigs[selectedCategory].length > 0 && (
                  <motion.div
                    key={`filters-${selectedCategory}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-8"
                  >
                    {filterConfigs[selectedCategory].map((filter, filterIdx) => (
                      <motion.div
                        key={filter.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: filterIdx * 0.08, duration: 0.3 }}
                      >
                        <h3 className="font-bold mb-4 text-lg">{filter.label}</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {filter.options.map((option, i) => (
                            <motion.label
                              key={option}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: filterIdx * 0.08 + i * 0.03, duration: 0.2 }}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  checked={(dynamicFilters[filter.id] || []).includes(option)}
                                  onChange={() => toggleDynamicFilter(filter.id, option)}
                                  className="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:border-purple-600 checked:bg-purple-600 dark:checked:border-purple-500 dark:checked:bg-purple-500 transition-colors cursor-pointer"
                                />
                                <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-sm" />
                              </div>
                              <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{option}</span>
                            </motion.label>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile filter */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold">
              {query ? `Kết quả tìm kiếm cho "${query}"` : 'Tất cả sản phẩm'} <span className="text-slate-500 text-lg font-normal">({filteredProducts.length})</span>
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Sắp xếp theo:</span>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="best-selling">Bán chạy</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                    <FiChevronLeft />
                  </button>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-md shadow-purple-500/20">
                    1
                  </button>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    2
                  </button>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    3
                  </button>
                  <span className="px-2">...</span>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-40 h-40 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <FiSearch className="text-6xl text-slate-300 dark:text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm nào</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn. Vui lòng thử lại với các tiêu chí khác.
              </p>
              <button 
                onClick={() => {
                  setPriceRange([0, 100000000]);
                  setSelectedCategory('all');
                  setSelectedBrands([]);
                  setDynamicFilters({});
                }}
                className="btn btn-primary btn-md"
              >
                Xóa bộ lọc
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
