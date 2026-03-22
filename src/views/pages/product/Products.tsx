import { useState, useEffect, useCallback } from 'react';
import { FiFilter, FiChevronDown, FiX, FiChevronLeft, FiChevronRight, FiSearch, FiCheck, FiLoader } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ui/ProductCard';
import { productService, categoryService, brandService } from '@/apis';
import type { ProductResponse, CategoryResponse, BrandResponse, PageResponse } from '@/types';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── Filter state (synced with URL query params) ──────────────
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(searchParams.get('categorySlug') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'DESC');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // ─── Data state ───────────────────────────────────────────────
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<ProductResponse> | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);

  // ─── Fetch categories & brands (once) ─────────────────────────
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryService.getTree(),
          brandService.getAll(),
        ]);
        // Flatten category tree for the filter sidebar
        const flatCats: CategoryResponse[] = [];
        const flatten = (list: CategoryResponse[]) => {
          list.forEach((c) => {
            flatCats.push(c);
            if (c.children?.length) flatten(c.children);
          });
        };
        if (catRes?.data) flatten(catRes.data);
        setCategories(flatCats);

        if (brandRes?.data?.data) setBrands(brandRes.data.data);
        else if (Array.isArray(brandRes?.data)) setBrands(brandRes.data as unknown as BrandResponse[]);
      } catch (err) {
        console.error('[Products] Failed to load filters:', err);
      } finally {
        setIsFiltersLoaded(true);
      }
    };
    loadFilters();
  }, []);

  // ─── Fetch products ───────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.search({
        keyword: keyword || undefined,
        categorySlug: selectedCategorySlug || undefined,
        brand: selectedBrand || undefined,
        page,
        size: 12,
        sortBy,
        sortDir,
      });

      if (res?.data) {
        setPageInfo(res.data);
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error('[Products] Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedCategorySlug, selectedBrand, page, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── Sync filters → URL ───────────────────────────────────────
  useEffect(() => {
    const params: Record<string, string> = {};
    if (keyword) params.keyword = keyword;
    if (selectedCategorySlug) params.categorySlug = selectedCategorySlug;
    if (selectedBrand) params.brand = selectedBrand;
    if (sortBy !== 'createdAt') params.sortBy = sortBy;
    if (sortDir !== 'DESC') params.sortDir = sortDir;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [keyword, selectedCategorySlug, selectedBrand, sortBy, sortDir, page, setSearchParams]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleCategoryChange = (slug: string) => {
    setSelectedCategorySlug(slug === selectedCategorySlug ? '' : slug);
    setPage(1);
  };

  const handleBrandChange = (brandSlug: string) => {
    setSelectedBrand(brandSlug === selectedBrand ? '' : brandSlug);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const map: Record<string, { sortBy: string; sortDir: string }> = {
      newest: { sortBy: 'createdAt', sortDir: 'DESC' },
      'price-asc': { sortBy: 'originPrice', sortDir: 'ASC' },
      'price-desc': { sortBy: 'originPrice', sortDir: 'DESC' },
      'best-rated': { sortBy: 'averageRating', sortDir: 'DESC' },
    };
    const s = map[value] || map.newest;
    setSortBy(s.sortBy);
    setSortDir(s.sortDir);
    setPage(1);
  };

  const currentSortValue = () => {
    if (sortBy === 'originPrice' && sortDir === 'ASC') return 'price-asc';
    if (sortBy === 'originPrice' && sortDir === 'DESC') return 'price-desc';
    if (sortBy === 'averageRating') return 'best-rated';
    return 'newest';
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategorySlug('');
    setSelectedBrand('');
    setSortBy('createdAt');
    setSortDir('DESC');
    setPage(1);
  };

  const totalPages = pageInfo?.lastPage || 1;

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-purple-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><span className="text-slate-900 dark:text-slate-100 font-medium">Tất cả sản phẩm</span></li>
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

        {/* ═══ Sidebar Filters ═══ */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto p-6 lg:p-0 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-xl font-bold">Bộ lọc</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <FiX />
              </button>
            </div>

            <div className="space-y-8 pb-8">
              {/* Search */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Tìm kiếm</h3>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                    placeholder="Tên sản phẩm..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Danh mục sản phẩm</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedCategorySlug(''); setPage(1); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${
                      !selectedCategorySlug
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${
                        selectedCategorySlug === cat.slug
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h3 className="font-bold mb-4 text-lg">Thương hiệu</h3>
                  <div className="space-y-3">
                    {brands.map((brand, i) => (
                      <motion.label
                        key={brand.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={selectedBrand === brand.slug}
                            onChange={() => handleBrandChange(brand.slug)}
                            className="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:border-purple-600 checked:bg-purple-600 dark:checked:border-purple-500 dark:checked:bg-purple-500 transition-colors cursor-pointer"
                          />
                          <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-sm" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {brand.name}
                          {brand.productCount > 0 && (
                            <span className="text-xs text-slate-400 ml-1">({brand.productCount})</span>
                          )}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {(keyword || selectedCategorySlug || selectedBrand) && (
                <button
                  onClick={handleClearFilters}
                  className="w-full py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
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

        {/* ═══ Main Content ═══ */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold">
              Tất cả sản phẩm{' '}
              <span className="text-slate-500 text-lg font-normal">
                ({pageInfo?.total || 0})
              </span>
            </h1>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Sắp xếp theo:</span>
              <div className="relative">
                <select 
                  value={currentSortValue()}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="best-rated">Đánh giá cao</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                      <FiChevronLeft />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                            pageNum === page
                              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
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
                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn. Vui lòng thử lại với các tiêu chí khác.
              </p>
              <button 
                onClick={handleClearFilters}
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
