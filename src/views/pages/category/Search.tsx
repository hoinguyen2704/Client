import { useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiX, FiChevronLeft, FiChevronRight, FiSearch, FiCheck } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService, brandService } from '@/apis';
import type { ProductResponse, CategoryResponse, BrandResponse, PageResponse } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || searchParams.get('keyword') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categorySlug') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load categories + brands
  useEffect(() => {
    Promise.allSettled([
      categoryService.getTree(),
      brandService.getAll(),
    ]).then(([catRes, brandRes]) => {
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
      if (brandRes.status === 'fulfilled') {
        const d = brandRes.value.data;
        // getAll() trả về PageResponse hoặc array tuỳ server
        setBrands(Array.isArray(d) ? d : (d as any)?.content || []);
      }
    });
  }, []);

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.search({
          keyword: query || undefined,
          categorySlug: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          page,
          size: 16,
          sortBy,
          sortDir,
        });
        const pageData = res.data;
        setProducts(pageData?.data || []);
        setTotalPages(pageData?.lastPage || 0);
        setTotalElements(pageData?.total || 0);
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    // Sync URL params
    const params: Record<string, string> = {};
    if (query) params.keyword = query;
    if (selectedCategory) params.categorySlug = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (sortBy !== 'createdAt') params.sortBy = sortBy;
    if (sortDir !== 'desc') params.sortDir = sortDir;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [query, selectedCategory, selectedBrand, sortBy, sortDir, page]);

  const handleSortChange = (value: string) => {
    if (value === 'price-asc') { setSortBy('price'); setSortDir('asc'); }
    else if (value === 'price-desc') { setSortBy('price'); setSortDir('desc'); }
    else { setSortBy('createdAt'); setSortDir('desc'); }
    setPage(1);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? '' : slug);
    setPage(1);
  };

  const handleBrandChange = (slug: string) => {
    setSelectedBrand(slug === selectedBrand ? '' : slug);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(1);
  };

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
              {/* Categories */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${selectedCategory === cat.slug ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Thương hiệu</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedBrand === brand.slug}
                          onChange={() => handleBrandChange(brand.slug)}
                          className="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:border-purple-600 checked:bg-purple-600 dark:checked:border-purple-500 dark:checked:bg-purple-500 transition-colors cursor-pointer"
                        />
                        <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-sm" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile filter */}
        {isFilterOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold">
              {query ? `Kết quả cho "${query}"` : 'Tất cả sản phẩm'} 
              <span className="text-slate-500 text-lg font-normal"> ({totalElements})</span>
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Sắp xếp:</span>
              <div className="relative">
                <select 
                  value={sortBy === 'price' ? (sortDir === 'asc' ? 'price-asc' : 'price-desc') : 'newest'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                      <FiChevronLeft />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages);
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${page === pageNum ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
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
                Vui lòng thử lại với các tiêu chí khác.
              </p>
              <button onClick={clearFilters} className="btn btn-primary btn-md">
                Xóa bộ lọc
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
