import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiPackage, FiFilter } from 'react-icons/fi';
import adminProductService from '@/apis/services/adminProductService';
import adminCategoryService from '@/apis/services/adminCategoryService';
import adminBrandService from '@/apis/services/adminBrandService';
import type { ProductResponse, ProductVariantResponse, CategoryResponse, BrandResponse } from '@/types';
import { PrimaryButton, Button, CustomSelect, Pagination, AdminSearch } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { useDebounce } from '@/hooks/useDebounce';
import type { SelectedVariant } from '@/components/dialog/SelectedVariant';
import { resolveVariantSalesMetrics } from '@/utils/variantSales';
import ProductPickerProductRow from './components/ProductPickerProductRow';

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
  const initialSelectedIdSet = useMemo(() => new Set(initialSelectedIds), [initialSelectedIds]);

  const getTotalStock = useCallback((product: ProductResponse) => {
    return (product.variants || []).reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0);
  }, []);

  const createSelectedVariant = useCallback(
    (product: ProductResponse, variant: ProductVariantResponse): SelectedVariant => {
      const sales = resolveVariantSalesMetrics(variant);

      return {
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        variantName: variant.variantName || 'Mặc định',
        originalPrice: variant.price,
        imageUrl: variant.images?.[0]?.imageUrl || product.mainImageUrl || '',
        grossSoldQty: sales.gross,
        returnedQty: sales.returned,
        netSoldQty: sales.net,
        stockQuantity: variant.stockQuantity ?? 0,
      };
    },
    [],
  );

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
        next[variant.id] = createSelectedVariant(product, variant);
      }
      return next;
    });
  };

  const handleSelectAllVariants = (product: ProductResponse) => {
    const variants = product.variants || [];
    const allNewSelected = variants.every(v => selectedMap[v.id] || initialSelectedIdSet.has(v.id));

    setSelectedMap(prev => {
      const next = { ...prev };
      if (allNewSelected) {
        // Deselect all non-initial variants
        variants.forEach(v => {
          if (!initialSelectedIdSet.has(v.id)) {
            delete next[v.id];
          }
        });
      } else {
        // Select all non-initial variants
        variants.forEach(v => {
          if (!initialSelectedIdSet.has(v.id) && !next[v.id]) {
            next[v.id] = createSelectedVariant(product, v);
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
          <div className="max-w-2xl">
            <AdminSearch
              boxed={false}
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={keyword}
              onChange={setKeyword}
              autoFocus
              clearable
              inputClassName="border border-slate-300 dark:border-slate-700 text-15 font-medium focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
            />
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
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">Đã bán (Gross)</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">Tồn kho</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">Thao tác</div>
              </div>
              {paginatedProducts.map(product => (
                <ProductPickerProductRow
                  key={product.id}
                  product={product}
                  initialSelectedIdSet={initialSelectedIdSet}
                  selectedMap={selectedMap}
                  getTotalStock={getTotalStock}
                  isExpanded={!!expandedProducts[product.id]}
                  onToggleProduct={() => handleToggleProduct(product.id)}
                  onToggleSelectAll={() => handleSelectAllVariants(product)}
                  onToggleVariant={(variantId) => {
                    const targetVariant = (product.variants || []).find((variant) => variant.id === variantId);
                    if (targetVariant) {
                      handleToggleVariant(product, targetVariant);
                    }
                  }}
                />
              ))}
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
