import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { FiFilter, FiChevronDown, FiX, FiSearch } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  Pagination,
  ProductCard,
  SearchableDropdown,
} from "@/components";
import { productService, categoryService, brandService } from "@/apis";
import type {
  ProductResponse,
  CategoryResponse,
  BrandResponse,
  PageResponse,
} from "@/types";
import { toast } from "sonner";

export default function Products() {
  const { t } = useTranslation(["catalog", "layout"]);
  const [searchParams, setSearchParams] = useSearchParams();

  //  Filter state (synced with URL query params)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    searchParams.get("categorySlug") || "",
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt",
  );
  const [sortDir, setSortDir] = useState(searchParams.get("sortDir") || "DESC");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  //  Data state
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [pageInfo, setPageInfo] =
    useState<PageResponse<ProductResponse> | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);

  //  Fetch categories & brands (once)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryService.getAllActive(),
          brandService.getAll(),
        ]);
        setCategories(catRes?.data || []);

        if (brandRes?.data?.data) setBrands(brandRes.data.data);
        else if (Array.isArray(brandRes?.data))
          setBrands(brandRes.data as unknown as BrandResponse[]);
      } catch (err) {
        console.error("[Products] Failed to load filters:", err);
      } finally {
        setIsFiltersLoaded(true);
      }
    };
    loadFilters();
  }, []);

  // Debounce keyword to avoid fetching on every keystroke.
  const debouncedKeyword = useDebounce(keyword, 400);

  //  Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.search({
        keyword: debouncedKeyword || undefined,
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
      console.error("[Products] Failed to fetch products:", err);
      toast.error(t("products.toasts.loadFailed"));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedKeyword,
    selectedCategorySlug,
    selectedBrand,
    page,
    sortBy,
    sortDir,
    t,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  //  Sync filters → URL (one-direction: state → URL, no searchParams in deps)
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedKeyword) params.keyword = debouncedKeyword;
    if (selectedCategorySlug) params.categorySlug = selectedCategorySlug;
    if (selectedBrand) params.brand = selectedBrand;
    if (sortBy !== "createdAt") params.sortBy = sortBy;
    if (sortDir !== "DESC") params.sortDir = sortDir;
    if (page > 1) params.page = String(page);

    setSearchParams(params, { replace: true });
  }, [
    debouncedKeyword,
    selectedCategorySlug,
    selectedBrand,
    sortBy,
    sortDir,
    page,
    setSearchParams,
  ]);

  //  Handlers
  const handleCategoryChange = (slug: string) => {
    setSelectedCategorySlug(slug === selectedCategorySlug ? "" : slug);
    setPage(1);
  };

  const handleBrandChange = (brandSlug: string) => {
    setSelectedBrand(brandSlug === selectedBrand ? "" : brandSlug);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const map: Record<string, { sortBy: string; sortDir: string }> = {
      popular: { sortBy: "popular", sortDir: "DESC" },
      newest: { sortBy: "createdAt", sortDir: "DESC" },
      "price-asc": { sortBy: "originPrice", sortDir: "ASC" },
      "price-desc": { sortBy: "originPrice", sortDir: "DESC" },
      "best-rated": { sortBy: "averageRating", sortDir: "DESC" },
    };
    const s = map[value] || map.newest;
    setSortBy(s.sortBy);
    setSortDir(s.sortDir);
    setPage(1);
  };

  const currentSortValue = () => {
    if (sortBy === "originPrice" && sortDir === "ASC") return "price-asc";
    if (sortBy === "originPrice" && sortDir === "DESC") return "price-desc";
    if (sortBy === "averageRating") return "best-rated";
    if (sortBy === "createdAt") return "newest";
    return "newest";
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedCategorySlug("");
    setSelectedBrand("");
    setSortBy("createdAt");
    setSortDir("DESC");
    setPage(1);
  };

  const totalPages = pageInfo?.lastPage || 1;
  const hasActiveFilters = Boolean(
    keyword || selectedCategorySlug || selectedBrand,
  );

  //  Render
  return (
    <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 py-5 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm sm:text-md text-muted mb-5 sm:mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <Link
              to="/"
              className="transition-colors hover:text-blue-700 dark:hover:text-blue-300"
            >
              {t("layout:navigation.home")}
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <span className="text-ink font-medium">
              {t("products.breadcrumbCurrent")}
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
        {/* Mobile Filter Toggle */}
        <button
          className="lg:hidden flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-md font-semibold"
          onClick={() => setIsFilterOpen(true)}
        >
          <FiFilter /> {t("products.mobileFilter")}
        </button>

        {/*  Sidebar Filters  */}
        <aside
          className={`fixed inset-y-0 left-0 z-[80] w-[86vw] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="h-full overflow-y-auto p-4 sm:p-6 lg:rounded-[24px] lg:border lg:border-slate-200 dark:lg:border-slate-800 lg:bg-white dark:lg:bg-slate-900 lg:p-5 custom-scrollbar">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-bold">{t("products.filterTitle")}</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-8 pb-8">
              {/* Search */}
              <div>
                <h3 className="font-bold mb-4 text-lg">
                  {t("products.searchTitle")}
                </h3>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t("products.searchPlaceholder")}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-md shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="font-bold text-lg">
                    {t("products.categoriesTitle")}
                  </h3>
                  <motion.span
                    animate={{ rotate: isCategoryOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronDown className="text-subtle" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedCategorySlug("");
                            setPage(1);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${
                            !selectedCategorySlug
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 font-medium"
                              : "text-muted hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {t("products.allCategories")}
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.slug)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${
                              selectedCategorySlug === cat.slug
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 font-medium"
                                : "text-muted hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <button
                    onClick={() => setIsBrandOpen(!isBrandOpen)}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <h3 className="font-bold text-lg">
                      {t("products.brandsTitle")}
                    </h3>
                    <motion.span
                      animate={{ rotate: isBrandOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown className="text-subtle" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isBrandOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3">
                          {brands.map((brand, i) => (
                            <motion.label
                              key={brand.id}
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03, duration: 0.2 }}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <Checkbox
                                checked={selectedBrand === brand.slug}
                                onCheckedChange={() =>
                                  handleBrandChange(brand.slug)
                                }
                                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600"
                              />
                              <span className="text-body group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                {brand.name}
                                {brand.productCount > 0 && (
                                  <span className="text-sm text-subtle ml-1">
                                    ({brand.productCount})
                                  </span>
                                )}
                              </span>
                            </motion.label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Clear Filters */}
              <div className="relative h-14">
                <button
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  className={`absolute inset-x-0 top-0 w-full rounded-2xl border py-2.5 text-md font-medium transition-all ${
                    hasActiveFilters
                      ? "border-red-200/80 bg-red-50/70 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 opacity-100"
                      : "border-transparent bg-transparent text-transparent opacity-0 pointer-events-none"
                  }`}
                >
                  {t("products.clearFilters")}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile filter */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[70] lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/*  Main Content  */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold">
              {t("products.pageTitle")}{" "}
              <span className="text-muted text-md sm:text-lg font-normal">
                ({pageInfo?.total || 0})
              </span>
            </h1>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="text-sm sm:text-md text-muted">
                {t("products.sortBy")}
              </span>
              <div>
                <SearchableDropdown
                  label="Sort By"
                  labelClassName="hidden"
                  required={false}
                  value={currentSortValue()}
                  onChange={(v) => handleSortChange(v)}
                  buttonClassName="w-44 sm:w-56 h-9 sm:h-10"
                  placeholder={t("products.sortOptions.popular")}
                  searchPlaceholder={t("products.searchOptions")}
                  allowClear={false}
                  items={[
                    { id: "popular", name: t("products.sortOptions.popular") },
                    { id: "newest", name: t("products.sortOptions.newest") },
                    {
                      id: "best-rated",
                      name: t("products.sortOptions.bestRated"),
                    },
                    {
                      id: "price-asc",
                      name: t("products.sortOptions.priceAsc"),
                    },
                    {
                      id: "price-desc",
                      name: t("products.sortOptions.priceDesc"),
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse"
                >
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
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="mt-8 sm:mt-12"
              />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-14 sm:py-20 text-center"
            >
              <div className="w-28 h-28 sm:w-40 sm:h-40 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <FiSearch className="text-4xl sm:text-6xl text-subtle" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {t("products.empty.title")}
              </h2>
              <p className="text-md sm:text-base text-muted mb-6 sm:mb-8 max-w-md">
                {t("products.empty.description")}
              </p>
              <Button onClick={handleClearFilters} size="md">
                {t("products.clearFilters")}
              </Button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
