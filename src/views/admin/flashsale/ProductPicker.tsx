import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiCheck, FiChevronRight, FiChevronDown, FiArrowLeft, FiPackage, FiFilter } from 'react-icons/fi';
import adminProductService from '@/apis/services/adminProductService';
import adminCategoryService from '@/apis/services/adminCategoryService';
import adminBrandService from '@/apis/services/adminBrandService';
import type { ProductResponse, ProductVariantResponse, CategoryResponse, BrandResponse } from '@/types';
import { PrimaryButton, Button, CustomSelect, Pagination } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { formatPrice } from '@/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import type { SelectedVariant } from '@/components/dialog/SelectedVariant';

// Key used to pass selected variants back through location.state
export const PICKER_RESULT_KEY = 'pickerSelectedVariants';

type PickerSortMode = 'DEFAULT' | 'SOLD_DESC' | 'SOLD_ASC' | 'STOCK_DESC' | 'STOCK_ASC';
const PRODUCTS_PER_PAGE = PAGE_SIZE.LARGE;

export default function ProductPicker() {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive initial data from the calling page
  const initialSelectedIds: string[] = location.state?.initialSelectedIds || [];
  const returnTo: string = location.state?.returnTo || '/admin/flash-sales';

  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<PickerSortMode>('DEFAULT');

  const [selectedMap, setSelectedMap] = useState<Record<string, SelectedVariant>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const getTotalStock = useCallback((product: ProductResponse) => {
    return (product.variants || []).reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0);
  }, []);

  const fetchProducts = useCallback(async (search: string, selectedCategoryId: string, selectedBrandId: string) => {
    setLoading(true);
    try {
      const baseParams: Record<string, unknown> = {
        keyword: search || undefined,
        categoryId: selectedCategoryId !== 'ALL' ? selectedCategoryId : undefined,
        page: 1,
        size: 100,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      };
      const firstRes = await adminProductService.getAll(baseParams);
      const firstPage = firstRes.data;
      const allProducts: ProductResponse[] = [...(firstPage?.data || [])];
      const lastPage = Math.max(firstPage?.lastPage || 1, 1);

      if (lastPage > 1) {
        const pageRequests = Array.from({ length: lastPage - 1 }, (_, idx) =>
          adminProductService.getAll({ ...baseParams, page: idx + 2 }),
        );
        const pageResponses = await Promise.all(pageRequests);
        pageResponses.forEach((response) => {
          allProducts.push(...(response.data?.data || []));
        });
      }

      const normalizedList = selectedBrandId !== 'ALL'
        ? allProducts.filter((product) => product.brandId === selectedBrandId)
        : allProducts;
      setProducts(normalizedList);

      // Auto-expand first 5 products when searching
      if (search) {
        const expandMap: Record<string, boolean> = {};
        normalizedList.slice(0, 5).forEach((p: ProductResponse) => expandMap[p.id] = true);
        setExpandedProducts(prev => ({ ...prev, ...expandMap }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedKeyword, categoryFilter, brandFilter);
  }, [debouncedKeyword, categoryFilter, brandFilter, fetchProducts]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoryRes, brandRes] = await Promise.all([
          adminCategoryService.getAll({ size: 200 }),
          adminBrandService.getAll({ size: 200 }),
        ]);
        setCategories(categoryRes.data?.data || []);
        setBrands(brandRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load filter data:', err);
      }
    };
    loadFilters();
  }, []);

  const categoryOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Tất cả danh mục' },
      ...categories.map((category) => ({ value: category.id, label: category.name })),
    ],
    [categories],
  );

  const brandOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Tất cả nhãn hàng' },
      ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
    ],
    [brands],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'DEFAULT', label: 'Mặc định' },
      { value: 'SOLD_DESC', label: 'Đã bán: cao đến thấp' },
      { value: 'SOLD_ASC', label: 'Đã bán: thấp đến cao' },
      { value: 'STOCK_DESC', label: 'Tồn kho: cao đến thấp' },
      { value: 'STOCK_ASC', label: 'Tồn kho: thấp đến cao' },
    ],
    [],
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (sortMode === 'SOLD_DESC') {
      list.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    } else if (sortMode === 'SOLD_ASC') {
      list.sort((a, b) => (a.totalSold || 0) - (b.totalSold || 0));
    } else if (sortMode === 'STOCK_DESC') {
      list.sort((a, b) => getTotalStock(b) - getTotalStock(a));
    } else if (sortMode === 'STOCK_ASC') {
      list.sort((a, b) => getTotalStock(a) - getTotalStock(b));
    }

    return list;
  }, [products, sortMode, getTotalStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, categoryFilter, brandFilter, sortMode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleToggleProduct = (productId: string) => {
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleToggleVariant = (product: ProductResponse, variant: ProductVariantResponse) => {
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[variant.id]) {
        delete next[variant.id];
      } else {
        next[variant.id] = {
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          variantName: variant.variantName || 'Mặc định',
          originalPrice: variant.price,
          imageUrl: variant.images?.[0]?.imageUrl || product.mainImageUrl || '',
        };
      }
      return next;
    });
  };

  const handleSelectAllVariants = (product: ProductResponse) => {
    const variants = product.variants || [];
    const allNewSelected = variants.every(v => selectedMap[v.id] || initialSelectedIds.includes(v.id));

    setSelectedMap(prev => {
      const next = { ...prev };
      if (allNewSelected) {
        // Deselect all non-initial variants
        variants.forEach(v => {
          if (!initialSelectedIds.includes(v.id)) {
            delete next[v.id];
          }
        });
      } else {
        // Select all non-initial variants
        variants.forEach(v => {
          if (!initialSelectedIds.includes(v.id) && !next[v.id]) {
            next[v.id] = {
              variantId: v.id,
              productId: product.id,
              productName: product.name,
              variantName: v.variantName || 'Mặc định',
              originalPrice: v.price,
              imageUrl: v.images?.[0]?.imageUrl || product.mainImageUrl || '',
            };
          }
        });
      }
      return next;
    });
  };

  const handleConfirm = () => {
    navigate(returnTo, {
      state: { [PICKER_RESULT_KEY]: Object.values(selectedMap) },
    });
  };

  const handleCancel = () => {
    navigate(returnTo);
  };

  const selectedCount = Object.keys(selectedMap).length;
  const hasActiveFilters = categoryFilter !== 'ALL' || brandFilter !== 'ALL';

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FiPackage className="text-purple-500" />
                Chọn sản phẩm tham gia
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Tìm kiếm và chọn các phân loại sản phẩm cho Flash Sale
              </p>
            </div>
          </div>

          {/* Selected count badge */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Đã chọn <strong>{selectedCount}</strong> phân loại
              </span>
            </div>
          )}
        </div>

        {/* Search + Filters */}
        <div className="mt-4 space-y-3">
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              autoFocus
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-15 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                Xóa
              </button>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <FiFilter className="text-slate-400" />
              Bộ lọc
            </div>
            <CustomSelect
              value={categoryFilter}
              options={categoryOptions}
              onChange={setCategoryFilter}
              className="w-full lg:w-64 h-12"
            />
            <CustomSelect
              value={brandFilter}
              options={brandOptions}
              onChange={setBrandFilter}
              className="w-full lg:w-64 h-12"
            />
            <CustomSelect
              value={sortMode}
              options={sortOptions}
              onChange={(val) => setSortMode(val as PickerSortMode)}
              className="w-full lg:w-72 h-12"
            />
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  setCategoryFilter('ALL');
                  setBrandFilter('ALL');
                  setCurrentPage(1);
                }}
                variant="ghost"
                size="sm"
                className="w-full lg:w-auto"
              >
                Xóa lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Product List ── */}
      <div className="flex-1 py-4">
        <div className="border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-purple-500 rounded-full animate-spin" />
                Đang tìm kiếm...
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <FiPackage className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-400 text-md">Không tìm thấy sản phẩm nào</p>
              {(keyword || hasActiveFilters) && (
                <button
                  onClick={() => {
                    setKeyword('');
                    setCategoryFilter('ALL');
                    setBrandFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className="mt-2 text-sm text-purple-500 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              <div className="hidden md:grid grid-cols-[minmax(0,1fr)_170px_140px_170px] gap-0 bg-slate-100 dark:bg-slate-800/60 text-13 font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700">
                <div className="px-4 py-3.5">Sản phẩm</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">Đã bán (Net)</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">Tồn kho</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">Thao tác</div>
              </div>
              {paginatedProducts.map(product => {
                const isExpanded = expandedProducts[product.id];
                const variants = product.variants || [];
                const someSelected = variants.some(v => selectedMap[v.id] || initialSelectedIds.includes(v.id));
                const allSelected = variants.length > 0 && variants.every(v => selectedMap[v.id] || initialSelectedIds.includes(v.id));
                const totalSold = product.totalSold || 0;
                const totalStock = getTotalStock(product);

                return (
                  <div
                    key={product.id}
                    className={`flex flex-col transition-all ${
                      someSelected
                        ? 'ring-1 ring-inset ring-purple-200 dark:ring-purple-500/30 bg-purple-50/25 dark:bg-purple-500/5'
                        : ''
                    }`}
                  >
                    {/* Product Row */}
                    <div
                      className={`px-0 py-0 transition-colors
                        ${someSelected
                          ? 'bg-purple-50/45 dark:bg-purple-500/10 hover:bg-purple-50/70'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_170px_140px_170px] gap-0 items-stretch">
                        <button
                          type="button"
                          onClick={() => handleToggleProduct(product.id)}
                          className="flex items-center gap-3 text-left w-full px-4 py-4"
                        >
                          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-0'} text-slate-400`}>
                            {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                          </div>
                          <img
                            src={product.mainImageUrl || '/placeholder.png'}
                            alt={product.name}
                            className="w-11 h-11 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{product.name}</div>
                            <div className="text-sm text-slate-500 flex flex-wrap items-center gap-1.5">
                              <span>{variants.length} phân loại</span>
                              {product.category?.name && <span>• {product.category.name}</span>}
                              {product.brandName && <span>• {product.brandName}</span>}
                            </div>
                          </div>
                        </button>

                        <div className="hidden md:flex items-center justify-end text-right text-base font-bold text-slate-700 dark:text-slate-200 px-4 py-4 border-l border-slate-200 dark:border-slate-700">
                          {totalSold.toLocaleString('vi-VN')}
                        </div>
                        <div className="hidden md:flex items-center justify-end text-right px-4 py-4 border-l border-slate-200 dark:border-slate-700">
                          <span className={`inline-flex items-center justify-end min-w-[72px] px-2 py-1 rounded-md text-sm font-semibold ${
                            totalStock <= 0
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                              : totalStock < 10
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}>
                            {totalStock.toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-start md:justify-end gap-2 px-4 py-4 border-l border-slate-200 dark:border-slate-700">
                          {/* Select all toggle */}
                          {variants.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAllVariants(product);
                              }}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium flex-shrink-0
                                ${allSelected
                                  ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-purple-300 hover:text-purple-600'
                                }`}
                            >
                              {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                          )}

                          {someSelected && (
                            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <div className="md:hidden mt-2 pl-14 text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Đã bán: <strong className="text-slate-700 dark:text-slate-200">{totalSold.toLocaleString('vi-VN')}</strong></span>
                        <span>Tồn: <strong className="text-slate-700 dark:text-slate-200">{totalStock.toLocaleString('vi-VN')}</strong></span>
                      </div>
                    </div>

                    {/* Variants - expandable */}
                    {isExpanded && (
                      <div className="bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {variants.map(variant => {
                            const isAlreadyInSale = initialSelectedIds.includes(variant.id);
                            const isChecked = !!selectedMap[variant.id] || isAlreadyInSale;
                            const isNewlySelected = !!selectedMap[variant.id];

                            return (
                              <div
                                key={variant.id}
                                className={`grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_170px_140px_170px] gap-0 items-stretch transition-colors
                                  ${isAlreadyInSale
                                    ? 'opacity-50 cursor-not-allowed bg-amber-50/40 dark:bg-amber-500/5'
                                    : isNewlySelected
                                      ? 'cursor-pointer bg-purple-100/80 dark:bg-purple-500/25 shadow-[inset_5px_0_0_0_rgba(147,51,234,0.95)] border-y border-purple-200/90 dark:border-purple-400/30 hover:bg-purple-100 dark:hover:bg-purple-500/30'
                                      : 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/30'
                                  }`}
                                onClick={() => !isAlreadyInSale && handleToggleVariant(product, variant)}
                              >
                                <div className="flex items-center gap-3 pl-14 pr-4 py-3 min-w-0">
                                  {/* Checkbox */}
                                  <div className="flex-shrink-0">
                                    <div className={`w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center transition-all duration-150
                                      ${isAlreadyInSale
                                        ? 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500'
                                        : isChecked
                                          ? 'bg-purple-600 border-purple-600 shadow-[0_0_0_2px_rgba(147,51,234,0.15)]'
                                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-purple-400'}
                                    `}>
                                      {isChecked && <FiCheck className="text-white" strokeWidth={3} size={14} />}
                                    </div>
                                  </div>

                                  {/* Variant info */}
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-md font-semibold ${isNewlySelected ? 'text-purple-800 dark:text-purple-200' : 'text-slate-700 dark:text-slate-200'}`}>
                                      {variant.variantName || 'Mặc định'}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      Mã: {variant.sku}
                                      {isAlreadyInSale && <span className="ml-2 text-amber-500 font-medium">• Đã tham gia</span>}
                                    </div>
                                  </div>

                                  {/* Price */}
                                  <div className="font-semibold text-md text-slate-700 dark:text-slate-200 flex-shrink-0">
                                    {formatPrice(variant.price)}
                                  </div>
                                </div>

                                <div className="hidden md:flex flex-col items-end justify-center px-4 py-3 border-l border-slate-200 dark:border-slate-700 text-sm">
                                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {(variant.netSoldQty ?? Math.max((variant.grossSoldQty ?? 0) - (variant.returnedQty ?? 0), 0)).toLocaleString('vi-VN')}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    G {(variant.grossSoldQty ?? 0).toLocaleString('vi-VN')} / R {(variant.returnedQty ?? 0).toLocaleString('vi-VN')}
                                  </span>
                                </div>

                                <div className="hidden md:flex items-center justify-end px-4 py-3 border-l border-slate-200 dark:border-slate-700">
                                  <span className={`inline-flex items-center justify-end min-w-[72px] px-2 py-1 rounded-md text-sm font-semibold ${
                                    (variant.stockQuantity || 0) <= 0
                                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                      : (variant.stockQuantity || 0) < 10
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  }`}>
                                    {(variant.stockQuantity || 0).toLocaleString('vi-VN')}
                                  </span>
                                </div>

                                <div className={`hidden md:flex items-center justify-end px-4 py-3 border-l border-slate-200 dark:border-slate-700 text-sm ${
                                  isNewlySelected ? 'text-purple-700 dark:text-purple-200 font-bold' : 'text-slate-500'
                                }`}>
                                  {isNewlySelected ? 'Đã chọn' : 'Nhấn để chọn'}
                                </div>

                                <div className="md:hidden px-14 pb-3 text-sm text-slate-500 flex items-center gap-4">
                                  <span>Net: <strong className="text-slate-700 dark:text-slate-200">{(variant.netSoldQty ?? Math.max((variant.grossSoldQty ?? 0) - (variant.returnedQty ?? 0), 0)).toLocaleString('vi-VN')}</strong></span>
                                  <span>G/R: <strong className="text-slate-600 dark:text-slate-300">{(variant.grossSoldQty ?? 0).toLocaleString('vi-VN')}/{(variant.returnedQty ?? 0).toLocaleString('vi-VN')}</strong></span>
                                  <span>Tồn: <strong className="text-slate-700 dark:text-slate-200">{(variant.stockQuantity || 0).toLocaleString('vi-VN')}</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {!loading && filteredProducts.length > 0 && (
          <Pagination
            variant="admin"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            perPage={PRODUCTS_PER_PAGE}
            label="sản phẩm"
          />
        )}
      </div>

      {/* ── Sticky Footer ── */}
      <div className="sticky bottom-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-md text-slate-500">
            {selectedCount > 0 ? (
              <>
                Đã chọn: <strong className="text-purple-600">{selectedCount}</strong> phân loại mới
              </>
            ) : (
              'Chưa chọn phân loại nào'
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleCancel} variant="secondary" size="md" className="flex-1 sm:flex-none">
              Hủy
            </Button>
            <PrimaryButton
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              icon={<FiCheck />}
              className="flex-1 sm:flex-none"
            >
              Xác nhận ({selectedCount})
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
