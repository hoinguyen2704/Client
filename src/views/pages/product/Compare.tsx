import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiStar, FiSearch, FiInfo, FiShoppingCart, FiCopy, FiTrash2 } from 'react-icons/fi';
import { formatPrice } from '@/utils/format';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import productService from '@/apis/services/productService';
import { toast } from 'sonner';
import { Modal } from '@/components/ui';

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  brand?: string;
  rating?: number;
  specs?: Record<string, string>;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
}

export default function Compare() {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CompareProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const lockedCategoryId = compareItems.length > 0 ? compareItems[0].categoryId : null;
  const lockedCategoryName = compareItems.length > 0 ? compareItems[0].categoryName : null;

  const removeItem = (id: string) => setCompareItems(prev => prev.filter(item => item.id !== id));
  const clearAll = () => setCompareItems([]);

  const addItem = (product: CompareProduct) => {
    if (compareItems.length >= 4) return;
    if (compareItems.find(p => p.id === product.id)) return;
    if (lockedCategoryId && product.categoryId !== lockedCategoryId) return;
    setCompareItems(prev => [...prev, product]);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const params: any = { keyword: query.trim(), page: 1, size: 12 };
      if (lockedCategoryId && compareItems[0]?.categorySlug) {
        params.categorySlug = compareItems[0].categorySlug;
      }
      const res = await productService.search(params);
      setSearchResults((res.data?.data || []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, image: p.mainImageUrl,
        price: p.variants?.[0]?.price || p.originPrice || 0,
        brand: p.brandName, rating: p.averageRating,
        specs: p.specsJson ? (typeof p.specsJson === 'string' ? (() => { try { return JSON.parse(p.specsJson); } catch { return {}; } })() : p.specsJson) : {},
        categoryId: p.category?.id, categoryName: p.category?.name, categorySlug: p.category?.slug,
      })));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isModalOpen]);

  const isBest = (key: string, value: any) => {
    if (compareItems.length < 2) return false;
    if (key === 'price') return value === Math.min(...compareItems.map(i => i.price));
    if (key === 'rating') return value === Math.max(...compareItems.map(i => i.rating || 0));
    return false;
  };

  // Collect all spec keys
  const allSpecKeys = new Set<string>();
  compareItems.forEach(item => {
    if (item.specs) Object.keys(item.specs).forEach(k => allSpecKeys.add(k));
  });

  const colCount = compareItems.length + (compareItems.length < 4 ? 1 : 0); // +1 for add button col

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent inline-block">
          So sánh sản phẩm
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          {lockedCategoryName
            ? <>So sánh trong danh mục <strong className="text-purple-600">{lockedCategoryName}</strong> · Tối đa 4 sản phẩm</>
            : 'Chọn sản phẩm để so sánh chi tiết · Chỉ so sánh cùng danh mục'}
        </p>
      </div>

      {/* Category Lock Badge */}
      {lockedCategoryName && compareItems.length > 0 && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 text-purple-600 text-sm font-medium border border-purple-100 dark:border-purple-800/50">
            <FiInfo className="text-xs shrink-0" />
            {compareItems.length}/4 sản phẩm
          </span>
          {compareItems.length > 1 && (
            <button onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors">
              <FiTrash2 className="text-xs" /> Xóa tất cả
            </button>
          )}
        </div>
      )}

      {compareItems.length === 0 ? (
        /* ─── Empty State ────────────────────────────────────── */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center rotate-6 shadow-lg">
              <FiShoppingCart className="text-4xl text-purple-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg shadow-md -rotate-12">
              <FiPlus />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-slate-500 mb-6 max-w-sm text-sm">Thêm ít nhất 2 sản phẩm cùng danh mục để so sánh chi tiết thông số kỹ thuật, giá cả và đánh giá</p>
          <button onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all">
            Thêm sản phẩm đầu tiên
          </button>
        </motion.div>
      ) : (
        /* ─── Unified Comparison Table ────────────────────── */
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="min-w-[700px]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '160px' }} />
                  {compareItems.map(item => <col key={item.id} />)}
                  {compareItems.length < 4 && <col />}
                </colgroup>

                {/* ── Product Cards in thead ──────────────── */}
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 border-r border-slate-200 dark:border-slate-700 align-middle">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">So sánh</span>
                    </th>
                    {compareItems.map((item, idx) => (
                      <th key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 align-top">
                        <div className="relative group">
                          <button onClick={() => removeItem(item.id)}
                            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all z-10">
                            <FiX className="text-sm" />
                          </button>
                          <div className="flex flex-col items-center text-center">
                            {item.image ? (
                              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-3">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                              </div>
                            ) : (
                              <div className="w-32 h-32 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-3 flex items-center justify-center text-slate-300">
                                <FiShoppingCart className="text-3xl" />
                              </div>
                            )}
                            <Link to={`/product/${item.slug}`}
                              className="font-bold text-sm hover:text-purple-600 transition-colors line-clamp-2 leading-snug mb-1.5">
                              {item.name}
                            </Link>
                            <div className="text-lg font-black text-purple-600">{formatPrice(item.price)}</div>
                            {item.rating && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                                <FiStar className="fill-amber-400 text-amber-400" /> {item.rating}
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                    {compareItems.length < 4 && (
                      <th className="p-4 align-middle">
                        <button onClick={() => setIsModalOpen(true)}
                          className="w-full py-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all">
                          <FiPlus className="text-2xl mb-1.5" />
                          <span className="text-xs font-medium">Thêm SP</span>
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* ── Specs in tbody ──────────────────────── */}
                <tbody>
                  {/* Category */}
                  <tr className="bg-slate-50 dark:bg-slate-800/40">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700">Danh mục</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="px-4 py-3.5 text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                          {item.categoryName || '—'}
                        </span>
                      </td>
                    ))}
                    {compareItems.length < 4 && <td className="border-b border-slate-200 dark:border-slate-700" />}
                  </tr>

                  {/* Brand */}
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700">Thương hiệu</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="px-4 py-3.5 text-center text-sm font-medium border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                        {item.brand || '—'}
                      </td>
                    ))}
                    {compareItems.length < 4 && <td className="border-b border-slate-200 dark:border-slate-700" />}
                  </tr>

                  {/* Price */}
                  <tr className="bg-gradient-to-r from-purple-50/40 to-blue-50/40 dark:from-purple-950/10 dark:to-blue-950/10">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700">Giá bán</td>
                    {compareItems.map(item => {
                      const best = isBest('price', item.price);
                      return (
                        <td key={item.id} className={`px-4 py-4 text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${best ? 'bg-green-50/80 dark:bg-green-900/10' : ''}`}>
                          <span className={`font-black text-base ${best ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                            {formatPrice(item.price)}
                          </span>
                          {best && <div className="text-[10px] text-green-500 font-bold mt-0.5">✓ Giá tốt nhất</div>}
                        </td>
                      );
                    })}
                    {compareItems.length < 4 && <td className="border-b border-slate-200 dark:border-slate-700" />}
                  </tr>

                  {/* Rating */}
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700">Đánh giá</td>
                    {compareItems.map(item => {
                      const best = isBest('rating', item.rating || 0);
                      return (
                        <td key={item.id} className={`px-4 py-3.5 text-center border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${best ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                          {item.rating ? (
                            <>
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-bold ${best ? 'text-amber-600' : ''}`}>{item.rating}</span>
                                <FiStar className="text-amber-400 fill-amber-400 text-sm" />
                              </div>
                              {best && <div className="text-[10px] text-amber-500 font-bold mt-0.5">✓ Cao nhất</div>}
                            </>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      );
                    })}
                    {compareItems.length < 4 && <td className="border-b border-slate-200 dark:border-slate-700" />}
                  </tr>

                  {/* Spec Section Header */}
                  {allSpecKeys.size > 0 && (
                    <tr>
                      <td colSpan={compareItems.length + (compareItems.length < 4 ? 2 : 1)} className="px-5 py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông số kỹ thuật</span>
                      </td>
                    </tr>
                  )}

                  {/* Dynamic Specs */}
                  {Array.from(allSpecKeys).map((specKey, idx) => (
                    <tr key={specKey} className={`${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors`}>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-r border-slate-200 dark:border-slate-700 align-middle">
                        {specKey}
                      </td>
                      {compareItems.map(item => {
                        const val = item.specs?.[specKey];
                        const allVals = compareItems.map(i => i.specs?.[specKey]).filter(Boolean);
                        const allSame = allVals.length > 1 && new Set(allVals).size === 1;
                        return (
                          <td key={item.id} className="px-4 py-3.5 text-center text-sm border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 align-middle">
                            <span className={val ? (allSame ? 'text-slate-600 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white') : 'text-slate-300 dark:text-slate-600'}>
                              {val || '—'}
                            </span>
                          </td>
                        );
                      })}
                      {compareItems.length < 4 && <td className="border-b border-slate-200 dark:border-slate-700" />}
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
        title="Chọn sản phẩm"
        size="lg"
        scrollable
      >
        <div className="space-y-3">
          {lockedCategoryName && (
            <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-xl">
              <FiInfo className="shrink-0" />
              Chỉ hiển thị sản phẩm trong danh mục <strong>{lockedCategoryName}</strong>
            </div>
          )}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text"
              placeholder={lockedCategoryName ? `Tìm trong ${lockedCategoryName}...` : 'Tìm sản phẩm...'}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>
        </div>

        <div className="mt-4 space-y-1.5 max-h-[50vh] overflow-y-auto">
          {searching ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-3" />
              <span className="text-sm">Đang tìm...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <FiSearch className="text-3xl mb-3" />
              <span className="text-sm">{searchQuery ? 'Không tìm thấy sản phẩm' : 'Nhập tên sản phẩm để tìm'}</span>
            </div>
          ) : (
            searchResults.map(product => {
              const isSelected = !!compareItems.find(p => p.id === product.id);
              const isDiffCat = lockedCategoryId != null && product.categoryId !== lockedCategoryId;
              return (
                <motion.div key={product.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700'
                      : isDiffCat
                        ? 'border-transparent opacity-30 cursor-not-allowed'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                  }`}
                  onClick={() => !isSelected && !isDiffCat && addItem(product)}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-slate-50 dark:bg-slate-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300"><FiShoppingCart /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-purple-600 font-bold text-sm">{formatPrice(product.price)}</span>
                      {product.categoryName && (
                        <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{product.categoryName}</span>
                      )}
                    </div>
                    {isDiffCat && <span className="text-[11px] text-red-400">Khác danh mục</span>}
                  </div>
                  {isSelected ? (
                    <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0"><FiCheck className="text-sm" /></div>
                  ) : isDiffCat ? (
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 shrink-0"><FiX className="text-sm" /></div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-purple-500 hover:text-purple-500 shrink-0 transition-colors"><FiPlus className="text-sm" /></div>
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

