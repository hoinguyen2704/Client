import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiSearch, FiCheck } from 'react-icons/fi';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService, brandService } from '@/apis';
import type { ProductResponse, CategoryResponse, BrandResponse } from '@/types';
import { Button, Pagination, ProductCard, CustomSelect } from '@/components';
import { toast } from 'sonner';

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
        setBrands(Array.isArray(d) ? d : (d as { content?: BrandResponse[] })?.content || []);
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
        toast.error('Tìm kiếm thất bại!');
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
    const next = new URLSearchParams(params).toString();
    const current = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [query, selectedCategory, selectedBrand, sortBy, sortDir, page, setSearchParams]);

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
    <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 py-5 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm sm:text-md text-slate-500 mb-5 sm:mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-purple-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><span className="text-slate-900 dark:text-slate-100 font-medium">Tìm kiếm sản phẩm</span></li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          className="lg:hidden flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-md font-semibold"
          onClick={() => setIsFilterOpen(true)}
        >
          <FiFilter /> Lọc sản phẩm
        </button>

        {/* Sidebar Filters */}
        <aside className={`fixed inset-y-0 left-0 z-[80] w-[86vw] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-0 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-bold">Bộ lọc</h2>
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
                        <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-md" />
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
          <div className="fixed inset-0 bg-black/50 z-[70] lg:hidden" onClick={() => setIsFilterOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold">
              {query ? `Kết quả cho "${query}"` : 'Tất cả sản phẩm'} 
              <span className="text-slate-500 text-md sm:text-lg font-normal"> ({totalElements})</span>
            </h1>
            
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="text-sm sm:text-md text-slate-500">Sắp xếp:</span>
              <div>
                <CustomSelect 
                  value={sortBy === 'price' ? (sortDir === 'asc' ? 'price-asc' : 'price-desc') : 'newest'}
                  onChange={(v) => handleSortChange(v)}
                  dropdownAlign="right"
                  className="w-40 sm:w-48 h-9 sm:h-10"
                  options={[
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'price-asc', label: 'Giá tăng dần' },
                    { value: 'price-desc', label: 'Giá giảm dần' }
                  ]}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-8 sm:mt-12" />
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-14 sm:py-20 text-center"
            >
              <div className="w-28 h-28 sm:w-40 sm:h-40 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <FiSearch className="text-4xl sm:text-6xl text-slate-300 dark:text-slate-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Không tìm thấy sản phẩm nào</h2>
              <p className="text-md sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 max-w-md">
                Vui lòng thử lại với các tiêu chí khác.
              </p>
              <Button onClick={clearFilters} size="md">
                Xóa bộ lọc
              </Button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
