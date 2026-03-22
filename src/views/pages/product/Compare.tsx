import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiShoppingCart, FiCheck, FiStar, FiSearch } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import EmptyState from '@/components/ui/EmptyState';
import productService from '@/apis/services/productService';

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  brand?: string;
  rating?: number;
  specs?: Record<string, string>;
}

export default function Compare() {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CompareProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const removeItem = (id: string) => {
    setCompareItems(compareItems.filter(item => item.id !== id));
  };

  const addItem = (product: CompareProduct) => {
    if (compareItems.length < 3 && !compareItems.find(p => p.id === product.id)) {
      setCompareItems([...compareItems, product]);
    }
    setIsModalOpen(false);
  };

  const handleSearch = async (query?: string) => {
    const q = query ?? searchQuery;
    setSearching(true);
    try {
      const res = await productService.search({ keyword: q.trim(), page: 1, size: 10 });
      const products = (res.data?.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.mainImageUrl,
        price: p.variants?.[0]?.price || p.originPrice || 0,
        brand: p.brandName,
        rating: p.averageRating,
        specs: p.specsJson ? (typeof p.specsJson === 'string' ? (() => { try { return JSON.parse(p.specsJson); } catch { return {}; } })() : p.specsJson) : {},
      }));
      setSearchResults(products);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  // Auto-load sản phẩm khi mở modal
  useEffect(() => {
    if (isModalOpen && searchResults.length === 0) {
      handleSearch('');
    }
  }, [isModalOpen]);

  const isBestValue = (key: string, value: any, items: CompareProduct[]) => {
    if (key === 'price') return value === Math.min(...items.map(i => i.price));
    if (key === 'rating') return value === Math.max(...items.map(i => i.rating || 0));
    return false;
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">So sánh sản phẩm</h1>

      {compareItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 text-4xl mb-6 hover:scale-110 transition-transform">
            <FiPlus className="text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">Nhấn vào đây để thêm sản phẩm so sánh</p>
          <button onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
            Thêm sản phẩm
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-8">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="w-48 p-4 text-left font-medium text-slate-500 border-b border-slate-200 dark:border-slate-800">Sản phẩm</th>
                {compareItems.map(item => (
                  <th key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-800 relative align-top w-1/3">
                    <button onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <FiX />
                    </button>
                    <div className="flex flex-col items-center text-center mt-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-xl mb-4" />
                      ) : (
                        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 flex items-center justify-center text-slate-300"><FiShoppingCart className="text-3xl" /></div>
                      )}
                      <Link to={`/product/${item.slug}`} className="font-bold text-lg hover:text-purple-600 transition-colors line-clamp-2 mb-2">{item.name}</Link>
                      <div className="text-xl font-bold text-purple-600 mb-4">{formatPrice(item.price)}</div>
                    </div>
                  </th>
                ))}
                {compareItems.length < 3 && (
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 align-middle">
                    <button onClick={() => setIsModalOpen(true)}
                      className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all">
                      <FiPlus className="text-4xl mb-2" /><span className="font-medium">Thêm sản phẩm</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Thương hiệu', key: 'brand' },
                { label: 'Giá', key: 'price' },
                { label: 'Đánh giá', key: 'rating' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-500">{row.label}</td>
                  {compareItems.map(item => {
                    const value = (item as any)[row.key];
                    const isBest = isBestValue(row.key, value, compareItems);
                    return (
                      <td key={`${item.id}-${row.key}`}
                        className={`p-4 text-center ${isBest ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 font-medium' : ''}`}>
                        {row.key === 'rating' ? (
                          <div className="flex items-center justify-center gap-1">{value || '-'} <FiStar className="text-yellow-400 fill-yellow-400" /></div>
                        ) : row.key === 'price' ? formatPrice(value) : (value || '-')}
                      </td>
                    );
                  })}
                  {compareItems.length < 3 && <td />}
                </tr>
              ))}
              {/* Dynamic specs rows */}
              {(() => {
                const allSpecKeys = new Set<string>();
                compareItems.forEach(item => {
                  if (item.specs) Object.keys(item.specs).forEach(k => allSpecKeys.add(k));
                });
                return Array.from(allSpecKeys).map((specKey, idx) => (
                  <tr key={`spec-${idx}`} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-slate-500">{specKey}</td>
                    {compareItems.map(item => (
                      <td key={`${item.id}-${specKey}`} className="p-4 text-center text-sm">
                        {item.specs?.[specKey] || '-'}
                      </td>
                    ))}
                    {compareItems.length < 3 && <td />}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Search Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Chọn sản phẩm để so sánh</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><FiX className="text-xl" /></button>
            </div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-2">
              <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={() => handleSearch()} className="btn btn-primary btn-md"><FiSearch /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searching ? (
                <div className="text-center py-8 text-slate-400">Đang tìm kiếm...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Nhập tên sản phẩm và nhấn Enter để tìm</div>
              ) : (
                searchResults.map(product => {
                  const isSelected = compareItems.find(p => p.id === product.id);
                  return (
                    <div key={product.id}
                      className={`flex items-center gap-4 p-3 rounded-xl border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 cursor-pointer'}`}
                      onClick={() => !isSelected && addItem(product)}>
                      {product.image ? <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800" />}
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{product.name}</h4>
                        <p className="text-purple-600 font-bold">{formatPrice(product.price)}</p>
                      </div>
                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center"><FiCheck /></div>
                      ) : (
                        <button className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:border-purple-500 hover:text-purple-500"><FiPlus /></button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
