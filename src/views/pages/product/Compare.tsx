import { useState, useEffect, useMemo, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  FiPlus,
  FiX,
  FiCheck,
  FiStar,
  FiSearch,
  FiInfo,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { formatPrice } from "@/utils/format";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import productService from "@/apis/services/productService";
import { Modal } from "@/components";
import type { CompareProduct } from "@/types";

const toCompareSpecs = (
  specs: Array<{ name: string; value: string }> | undefined,
): Record<string, string> => {
  if (!specs || specs.length === 0) return {};
  return Object.fromEntries(
    specs
      .filter((spec) => spec?.name && spec?.value?.trim())
      .map((spec) => [spec.name, spec.value ?? ""]),
  );
};



export default function Compare() {
  const { t } = useTranslation(["catalog", "common"]);
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CompareProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const lockedCategoryId =
    compareItems.length > 0 ? compareItems[0].categoryId : null;
  const lockedCategoryName =
    compareItems.length > 0 ? compareItems[0].categoryName : null;

  const removeItem = (id: string) =>
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  const clearAll = () => setCompareItems([]);

  const addItem = (product: CompareProduct) => {
    if (compareItems.length >= 4) return;
    if (compareItems.find((p) => p.id === product.id)) return;
    if (lockedCategoryId && product.categoryId !== lockedCategoryId) return;
    setCompareItems((prev) => [...prev, product]);
    setIsModalOpen(false);
    setSearchQuery("");
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const params: Record<string, string | number> = { keyword: query.trim(), page: 1, size: 12 };
      if (lockedCategoryId && compareItems[0]?.categorySlug) {
        params.categorySlug = compareItems[0].categorySlug;
      }
      const res = await productService.search(params);
      setSearchResults(
        (res.data?.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.mainImageUrl,
          price: p.variants?.[0]?.price || p.originPrice || 0,
          brand: p.brandName,
          rating: p.averageRating,
          specs: toCompareSpecs(p.specs),
          categoryId: p.category?.id,
          categoryName: p.category?.name,
          categorySlug: p.category?.slug,
        })),
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [lockedCategoryId, compareItems]);

  useEffect(() => {
    if (!isModalOpen) return;
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isModalOpen, handleSearch]);

  const isBest = (key: string, value: number) => {
    if (compareItems.length < 2) return false;
    if (key === "price")
      return value === Math.min(...compareItems.map((i) => i.price));
    if (key === "rating")
      return value === Math.max(...compareItems.map((i) => i.rating || 0));
    return false;
  };

  // Memoize allSpecKeys — avoid Set creation + iteration on every render
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    compareItems.forEach((item) => {
      if (item.specs) Object.keys(item.specs).forEach((k) => keys.add(k));
    });
    return keys;
  }, [compareItems]);

  return (
    <div className="w-full px-2.5 sm:px-4 md:px-8 lg:px-12 py-5 sm:py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-8">
        <h1 className="inline-block text-2xl font-black tracking-tight text-ink sm:text-3xl">
          {t("catalog:compare.title")}
        </h1>
        <p className="text-muted mt-2 text-md">
          {lockedCategoryName ? (
            <Trans
              i18nKey="catalog:compare.descriptionWithCategory"
              values={{ category: lockedCategoryName }}
              components={{ strong: <strong className="text-blue-700 dark:text-blue-300" /> }}
            />
          ) : (
            t("catalog:compare.descriptionDefault")
          )}
        </p>
      </div>

      {/* Category Lock Badge */}
      {lockedCategoryName && compareItems.length > 0 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 sm:px-4 sm:py-2 sm:text-md">
            <FiInfo className="text-sm shrink-0" />
            {t("catalog:compare.selectedCount", { count: compareItems.length })}
          </span>
          {compareItems.length > 1 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl text-sm sm:text-md text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"
            >
              <FiTrash2 className="text-sm" /> {t("catalog:compare.clearAll")}
            </button>
          )}
        </div>
      )}

      {compareItems.length === 0 ? (
        /*  Empty State  */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 sm:py-20 text-center"
        >
          <div className="relative mb-8">
            <div className="flex h-24 w-24 rotate-6 items-center justify-center rounded-3xl bg-blue-50 shadow-lg dark:bg-blue-950/30 sm:h-28 sm:w-28">
              <FiShoppingCart className="text-3xl text-blue-600 dark:text-blue-300 sm:text-4xl" />
            </div>
          <div className="absolute -top-2 -right-2 flex h-10 w-10 -rotate-12 items-center justify-center rounded-xl bg-blue-600 text-lg text-white shadow-sm">
            <FiPlus />
          </div>
        </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">{t("catalog:compare.empty.title")}</h3>
          <p className="text-muted mb-5 sm:mb-6 max-w-sm text-md">
            {t("catalog:compare.empty.description")}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-blue-600 px-6 py-2.5 text-md font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 sm:px-8 sm:py-3 sm:text-base"
          >
            {t("catalog:compare.empty.action")}
          </button>
        </motion.div>
      ) : (
        /*  Unified Comparison Table  */
        <div className="overflow-x-auto pb-3 sm:pb-4 -mx-2.5 px-2.5 sm:-mx-4 sm:px-4">
          <div className="min-w-[560px] sm:min-w-[700px]">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table
                className="w-full border-collapse"
                style={{ tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "120px" }} />
                  {compareItems.map((item) => (
                    <col key={item.id} />
                  ))}
                  {compareItems.length < 4 && <col />}
                </colgroup>

                {/*  Product Cards in thead  */}
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5 sm:p-4 border-r border-slate-200 dark:border-slate-700 align-middle">
                      <span className="text-sm font-bold text-subtle uppercase tracking-wider">
                        {t("catalog:compare.table.title")}
                      </span>
                    </th>
                    {compareItems.map((item) => (
                      <th
                        key={item.id}
                        className="p-2.5 sm:p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 align-top"
                      >
                        <div className="relative group">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-subtle opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all z-10"
                          >
                            <FiX className="text-md" />
                          </button>
                          <div className="flex flex-col items-center text-center">
                            {item.image ? (
                              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-2 sm:mb-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1.5 sm:p-2"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 mb-2 sm:mb-3 flex items-center justify-center text-subtle">
                                <FiShoppingCart className="text-3xl" />
                              </div>
                            )}
                            <Link
                              to={`/product/${item.slug}`}
                              className="mb-1 line-clamp-2 text-sm font-bold leading-snug transition-colors hover:text-blue-700 dark:hover:text-blue-300 sm:text-md"
                            >
                              {item.name}
                            </Link>
                            <div className="text-md font-black text-ink sm:text-lg">
                              {formatPrice(item.price)}
                            </div>
                            {item.rating && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-amber-500">
                                <FiStar className="fill-amber-400 text-amber-400" />{" "}
                                {item.rating}
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                    {compareItems.length < 4 && (
                      <th className="p-2.5 sm:p-4 align-middle">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-4 text-subtle transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-700 dark:hover:bg-blue-950/20 dark:hover:text-blue-300 sm:rounded-2xl sm:py-8"
                        >
                          <FiPlus className="text-xl sm:text-2xl mb-1" />
                          <span className="text-sm font-medium">{t("catalog:compare.table.addProduct")}</span>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>

                {/*  Specs in tbody  */}
                <tbody>
                  {/* Category */}
                  <tr className="bg-slate-50 dark:bg-slate-800/40">
                    <td className="px-3 sm:px-5 py-3 text-sm sm:text-md font-semibold text-muted border-b border-r border-slate-200 dark:border-slate-700">
                      {t("catalog:compare.table.category")}
                    </td>
                    {compareItems.map((item) => (
                      <td
                        key={item.id}
                        className="px-2.5 sm:px-4 py-3 text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                      >
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                          {item.categoryName || "—"}
                        </span>
                      </td>
                    ))}
                    {compareItems.length < 4 && (
                      <td className="border-b border-slate-200 dark:border-slate-700" />
                    )}
                  </tr>

                  {/* Brand */}
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 sm:px-5 py-3 text-sm sm:text-md font-semibold text-muted border-b border-r border-slate-200 dark:border-slate-700">
                      {t("catalog:compare.table.brand")}
                    </td>
                    {compareItems.map((item) => (
                      <td
                        key={item.id}
                        className="px-2.5 sm:px-4 py-3 text-center text-sm sm:text-md font-medium border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                      >
                        {item.brand || "—"}
                      </td>
                    ))}
                    {compareItems.length < 4 && (
                      <td className="border-b border-slate-200 dark:border-slate-700" />
                    )}
                  </tr>

                  {/* Price */}
                  <tr className="bg-blue-50/50 dark:bg-blue-950/10">
                    <td className="px-3 sm:px-5 py-3 text-sm sm:text-md font-semibold text-muted border-b border-r border-slate-200 dark:border-slate-700">
                      {t("catalog:compare.table.price")}
                    </td>
                    {compareItems.map((item) => {
                      const best = isBest("price", item.price);
                      return (
                        <td
                          key={item.id}
                          className={`px-2.5 sm:px-4 py-3 text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${best ? "bg-green-50/80 dark:bg-green-900/10" : ""}`}
                        >
                          <span
                            className={`font-black text-md sm:text-base ${best ? "text-green-600" : "text-ink"}`}
                          >
                            {formatPrice(item.price)}
                          </span>
                          {best && (
                            <div className="text-10 text-green-500 font-bold mt-0.5">
                              ✓ {t("catalog:compare.table.bestPrice")}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {compareItems.length < 4 && (
                      <td className="border-b border-slate-200 dark:border-slate-700" />
                    )}
                  </tr>

                  {/* Rating */}
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 sm:px-5 py-3 text-sm sm:text-md font-semibold text-muted border-b border-r border-slate-200 dark:border-slate-700">
                      {t("catalog:compare.table.rating")}
                    </td>
                    {compareItems.map((item) => {
                      const best = isBest("rating", item.rating || 0);
                      return (
                        <td
                          key={item.id}
                          className={`px-2.5 sm:px-4 py-3 text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${best ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                        >
                          {item.rating ? (
                            <>
                              <div className="flex items-center justify-center gap-1">
                                <span
                                  className={`font-bold ${best ? "text-amber-600" : ""}`}
                                >
                                  {item.rating}
                                </span>
                                <FiStar className="text-amber-400 fill-amber-400 text-md" />
                              </div>
                              {best && (
                                <div className="text-10 text-amber-500 font-bold mt-0.5">
                                  ✓ {t("catalog:compare.table.highestRating")}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-subtle">—</span>
                          )}
                        </td>
                      );
                    })}
                    {compareItems.length < 4 && (
                      <td className="border-b border-slate-200 dark:border-slate-700" />
                    )}
                  </tr>

                  {/* Spec Section Header */}
                  {allSpecKeys.size > 0 && (
                    <tr>
                      <td
                        colSpan={
                          compareItems.length +
                          (compareItems.length < 4 ? 2 : 1)
                        }
                        className="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-sm font-bold text-muted uppercase tracking-wider">
                          {t("catalog:compare.table.specs")}
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Dynamic Specs */}
                  {Array.from(allSpecKeys).map((specKey, idx) => (
                    <tr
                      key={specKey}
                      className={`${idx % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-800/10" : ""} hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors`}
                    >
                      <td className="px-3 sm:px-5 py-3 text-sm sm:text-md font-semibold text-muted border-b border-r border-slate-200 dark:border-slate-700 align-middle">
                        {specKey}
                      </td>
                      {compareItems.map((item) => {
                        const val = item.specs?.[specKey];
                        const allVals = compareItems
                          .map((i) => i.specs?.[specKey])
                          .filter(Boolean);
                        const allSame =
                          allVals.length > 1 && new Set(allVals).size === 1;
                        return (
                          <td
                            key={item.id}
                            className="px-2.5 sm:px-4 py-3 text-center text-sm sm:text-md border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 align-middle"
                          >
                            <span
                              className={
                                val
                                  ? allSame
                                    ? "text-muted"
                                    : "font-bold text-ink"
                                  : "text-subtle"
                              }
                            >
                              {val || "—"}
                            </span>
                          </td>
                        );
                      })}
                      {compareItems.length < 4 && (
                        <td className="border-b border-slate-200 dark:border-slate-700" />
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("catalog:compare.modal.title")}
        size="lg"
        scrollable
      >
        <div className="space-y-3">
          {lockedCategoryName && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
              <FiInfo className="shrink-0" />
              <Trans
                i18nKey="catalog:compare.modal.lockedCategory"
                values={{ category: lockedCategoryName }}
                components={{ strong: <strong /> }}
              />
            </div>
          )}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder={
                lockedCategoryName
                  ? t("catalog:compare.modal.searchPlaceholderWithCategory", { category: lockedCategoryName })
                  : t("catalog:compare.modal.searchPlaceholder")
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-md outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="mt-4 space-y-1.5 max-h-[52vh] overflow-y-auto">
          {searching ? (
            <div className="flex flex-col items-center py-12 text-subtle">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <span className="text-md">{t("catalog:compare.modal.loading")}</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-subtle">
              <FiSearch className="text-3xl mb-3" />
              <span className="text-md">
                {searchQuery
                  ? t("catalog:compare.modal.emptyWithQuery")
                  : t("catalog:compare.modal.emptyDefault")}
              </span>
            </div>
          ) : (
            searchResults.map((product) => {
              const isSelected = !!compareItems.find(
                (p) => p.id === product.id,
              );
              const isDiffCat =
                lockedCategoryId != null &&
                product.categoryId !== lockedCategoryId;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/40"
                      : isDiffCat
                        ? "border-transparent opacity-30 cursor-not-allowed"
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  }`}
                  onClick={() => !isSelected && !isDiffCat && addItem(product)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-50 dark:bg-slate-800"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-subtle">
                      <FiShoppingCart />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-md line-clamp-1">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-md font-bold text-ink">
                        {formatPrice(product.price)}
                      </span>
                      {product.categoryName && (
                        <span className="text-11 text-subtle bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          {product.categoryName}
                        </span>
                      )}
                    </div>
                    {isDiffCat && (
                      <span className="text-11 text-red-400">
                        {t("catalog:compare.modal.differentCategory")}
                      </span>
                    )}
                  </div>
                  {isSelected ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <FiCheck className="text-md" />
                    </div>
                  ) : isDiffCat ? (
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-subtle shrink-0">
                      <FiX className="text-md" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-subtle transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:hover:text-blue-300">
                      <FiPlus className="text-md" />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}
