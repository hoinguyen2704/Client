import { useDeferredValue, useMemo, useState, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiPackage, FiFilter } from 'react-icons/fi';
import adminProductService from '@/apis/services/adminProductService';
import adminCategoryService from '@/apis/services/adminCategoryService';
import adminBrandService from '@/apis/services/adminBrandService';
import type {
  AdminProductPickerItem,
  AdminProductVariantSummary,
} from '@/types';
import { PrimaryButton, Button, CustomSelect, Pagination, AdminSearch } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { useDebounce } from '@/hooks/useDebounce';
import type { SelectedVariant } from '@/components/dialog/SelectedVariant';
import ProductPickerProductRow from './components/ProductPickerProductRow';

// Key used to pass selected variants back through location.state
export const PICKER_RESULT_KEY = 'pickerSelectedVariants';

type PickerSortMode = 'DEFAULT' | 'SOLD_DESC' | 'SOLD_ASC' | 'STOCK_DESC' | 'STOCK_ASC';
const PRODUCTS_PER_PAGE = PAGE_SIZE.LARGE;

export default function ProductPicker() {
  const { t } = useTranslation('adminCatalog');
  const navigate = useNavigate();
  const location = useLocation();

  // Receive initial data from the calling page
  const initialSelectedIds: string[] = location.state?.initialSelectedIds || [];
  const returnTo: string = location.state?.returnTo || '/admin/flash-sales';

  const [keyword, setKeyword] = useState('');
  const deferredKeyword = useDeferredValue(keyword);
  const debouncedKeyword = useDebounce(deferredKeyword, 400);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<PickerSortMode>('DEFAULT');

  const [selectedMap, setSelectedMap] = useState<Record<string, SelectedVariant>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const initialSelectedIdSet = useMemo(() => new Set(initialSelectedIds), [initialSelectedIds]);

  const sortParams = useMemo(() => {
    switch (sortMode) {
      case 'SOLD_DESC':
        return { sortBy: 'totalSold', sortDir: 'DESC' as const };
      case 'SOLD_ASC':
        return { sortBy: 'totalSold', sortDir: 'ASC' as const };
      case 'STOCK_DESC':
        return { sortBy: 'totalStock', sortDir: 'DESC' as const };
      case 'STOCK_ASC':
        return { sortBy: 'totalStock', sortDir: 'ASC' as const };
      default:
        return { sortBy: 'createdAt', sortDir: 'DESC' as const };
    }
  }, [sortMode]);

  const pickerQueryKey = useMemo(
    () => [
      'admin-product-picker',
      debouncedKeyword,
      categoryFilter,
      brandFilter,
      currentPage,
      sortParams.sortBy,
      sortParams.sortDir,
    ],
    [brandFilter, categoryFilter, currentPage, debouncedKeyword, sortParams.sortBy, sortParams.sortDir],
  );

  const categoriesQuery = useQuery({
    queryKey: ['admin-product-picker-categories'],
    queryFn: ({ signal }) =>
      adminCategoryService.getAll({ size: 200 }, { signal }).then((res) => res.data?.data || []),
    staleTime: 5 * 60_000,
  });

  const brandsQuery = useQuery({
    queryKey: ['admin-product-picker-brands'],
    queryFn: ({ signal }) =>
      adminBrandService.getAll({ size: 200 }, { signal }).then((res) => res.data?.data || []),
    staleTime: 5 * 60_000,
  });

  const productsQuery = useQuery({
    queryKey: pickerQueryKey,
    queryFn: ({ signal }) =>
      adminProductService.getPickerList({
        keyword: debouncedKeyword || undefined,
        categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        brandId: brandFilter !== 'ALL' ? brandFilter : undefined,
        page: currentPage,
        size: PRODUCTS_PER_PAGE,
        sortBy: sortParams.sortBy,
        sortDir: sortParams.sortDir,
      }, { signal }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });

  const createSelectedVariant = (
    product: AdminProductPickerItem,
    variant: AdminProductVariantSummary,
  ): SelectedVariant => ({
    variantId: variant.id,
    productId: product.id,
    productName: product.name,
    variantName: variant.variantName || t('productPicker.variantFallback'),
    originalPrice: variant.price,
    imageUrl: variant.imageUrl || product.mainImageUrl || '',
    grossSoldQty: variant.grossSoldQty ?? 0,
    returnedQty: variant.returnedQty ?? 0,
    netSoldQty: variant.netSoldQty ?? Math.max((variant.grossSoldQty ?? 0) - (variant.returnedQty ?? 0), 0),
    stockQuantity: variant.stockQuantity ?? 0,
  });

  const categories = categoriesQuery.data || [];
  const brands = brandsQuery.data || [];
  const pageData = productsQuery.data || null;
  const products = pageData?.data || [];
  const loading = productsQuery.isPending && !productsQuery.data;

  const categoryOptions = useMemo(
    () => [
      { value: 'ALL', label: t('productPicker.filters.allCategories') },
      ...categories.map((category) => ({ value: category.id, label: category.name })),
    ],
    [categories, t],
  );

  const brandOptions = useMemo(
    () => [
      { value: 'ALL', label: t('productPicker.filters.allBrands') },
      ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
    ],
    [brands, t],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'DEFAULT', label: t('productPicker.filters.default') },
      { value: 'SOLD_DESC', label: t('productPicker.filters.soldDesc') },
      { value: 'SOLD_ASC', label: t('productPicker.filters.soldAsc') },
      { value: 'STOCK_DESC', label: t('productPicker.filters.stockDesc') },
      { value: 'STOCK_ASC', label: t('productPicker.filters.stockAsc') },
    ],
    [t],
  );

  const handleToggleProduct = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleToggleVariant = (product: AdminProductPickerItem, variant: AdminProductVariantSummary) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[variant.id]) {
        delete next[variant.id];
      } else {
        next[variant.id] = createSelectedVariant(product, variant);
      }
      return next;
    });
  };

  const handleSelectAllVariants = (
    product: AdminProductPickerItem,
    variants: AdminProductVariantSummary[],
  ) => {
    const selectableVariants = variants.filter((variant) => !initialSelectedIdSet.has(variant.id));
    const allNewSelected = selectableVariants.length > 0 &&
      selectableVariants.every((variant) => !!selectedMap[variant.id]);

    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allNewSelected) {
        selectableVariants.forEach((variant) => {
          delete next[variant.id];
        });
      } else {
        selectableVariants.forEach((variant) => {
          if (!next[variant.id]) {
            next[variant.id] = createSelectedVariant(product, variant);
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
  const hasActiveFilters =
    keyword.trim().length > 0 ||
    categoryFilter !== 'ALL' ||
    brandFilter !== 'ALL' ||
    sortMode !== 'DEFAULT';

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
                {t('productPicker.heroTitle')}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('productPicker.heroDescription')}
              </p>
            </div>
          </div>

          {/* Selected count badge */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                <Trans i18nKey="adminCatalog:productPicker.selectedVariants" values={{ count: selectedCount }} components={{ strong: <strong /> }} />
              </span>
            </div>
          )}
        </div>

        {/* Search + Filters */}
        <div className="mt-4 space-y-3">
          <div className="max-w-2xl">
            <AdminSearch
              boxed={false}
              placeholder={t('productPicker.searchPlaceholder')}
              value={keyword}
              onChange={(value) => {
                startTransition(() => {
                  setKeyword(value);
                  setCurrentPage(1);
                });
              }}
              autoFocus
              clearable
              inputClassName="border border-slate-300 dark:border-slate-700 text-15 font-medium focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <FiFilter className="text-slate-400" />
              {t('productPicker.filtersTitle')}
            </div>
            <CustomSelect
              value={categoryFilter}
              options={categoryOptions}
              onChange={(value) => {
                startTransition(() => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                });
              }}
              className="w-full lg:w-64 h-12"
            />
            <CustomSelect
              value={brandFilter}
              options={brandOptions}
              onChange={(value) => {
                startTransition(() => {
                  setBrandFilter(value);
                  setCurrentPage(1);
                });
              }}
              className="w-full lg:w-64 h-12"
            />
            <CustomSelect
              value={sortMode}
              options={sortOptions}
              onChange={(value) => {
                startTransition(() => {
                  setSortMode(value as PickerSortMode);
                  setCurrentPage(1);
                });
              }}
              className="w-full lg:w-72 h-12"
            />
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  startTransition(() => {
                    setKeyword('');
                    setCategoryFilter('ALL');
                    setBrandFilter('ALL');
                    setSortMode('DEFAULT');
                    setCurrentPage(1);
                  });
                }}
                variant="ghost"
                size="sm"
                className="w-full lg:w-auto"
              >
                {t('productPicker.clearFilters')}
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
                {t('productPicker.loading')}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <FiPackage className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-400 text-md">{t('productPicker.empty')}</p>
              {(keyword || hasActiveFilters) && (
                <button
                  onClick={() => {
                    startTransition(() => {
                      setKeyword('');
                      setCategoryFilter('ALL');
                      setBrandFilter('ALL');
                      setSortMode('DEFAULT');
                      setCurrentPage(1);
                    });
                  }}
                  className="mt-2 text-sm text-purple-500 hover:underline"
                >
                  {t('productPicker.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              <div className="hidden md:grid grid-cols-[minmax(0,1fr)_170px_140px_170px] gap-0 bg-slate-100 dark:bg-slate-800/60 text-13 font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700">
                <div className="px-4 py-3.5">{t('productPicker.table.product')}</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">{t('productPicker.table.sold')}</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">{t('productPicker.table.stock')}</div>
                <div className="px-4 py-3.5 text-right border-l border-slate-300 dark:border-slate-700">{t('productPicker.table.actions')}</div>
              </div>
              {products.map((product) => (
                <ProductPickerProductRow
                  key={product.id}
                  product={product}
                  initialSelectedIdSet={initialSelectedIdSet}
                  selectedMap={selectedMap}
                  isExpanded={!!expandedProducts[product.id]}
                  onToggleProduct={() => handleToggleProduct(product.id)}
                  onToggleSelectAll={(variants) => handleSelectAllVariants(product, variants)}
                  onToggleVariant={(variant) => handleToggleVariant(product, variant)}
                />
              ))}
            </div>
          )}
        </div>
        {!loading && pageData && products.length > 0 && (
          <Pagination
            variant="admin"
            currentPage={currentPage}
            totalPages={pageData.lastPage}
            onPageChange={(page) => startTransition(() => setCurrentPage(page))}
            totalItems={pageData.total}
            perPage={PRODUCTS_PER_PAGE}
            label={t('productPicker.paginationLabel')}
          />
        )}
      </div>

      {/* ── Sticky Footer ── */}
      <div className="sticky bottom-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-md text-slate-500">
            {selectedCount > 0 ? (
              <Trans i18nKey="adminCatalog:productPicker.footerSelected" values={{ count: selectedCount }} components={{ strong: <strong className="text-purple-600" /> }} />
            ) : (
              t('productPicker.footerEmpty')
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleCancel} variant="secondary" size="md" className="flex-1 sm:flex-none">
              {t('productPicker.cancel')}
            </Button>
            <PrimaryButton
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              icon={<FiCheck />}
              className="flex-1 sm:flex-none"
            >
              {t('productPicker.confirm', { count: selectedCount })}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
