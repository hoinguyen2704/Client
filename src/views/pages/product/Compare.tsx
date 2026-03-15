import { useState } from 'react';
import { FiPlus, FiX, FiShoppingCart, FiCheck, FiStar } from 'react-icons/fi';
import { mockProducts } from '@/utils/mockData';
import { formatPrice } from '@/helpers/format';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Compare() {
  const [compareItems, setCompareItems] = useState([mockProducts[0], mockProducts[1]]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeItem = (id: string) => {
    setCompareItems(compareItems.filter(item => item.id !== id));
  };

  const addItem = (product: any) => {
    if (compareItems.length < 3 && !compareItems.find(p => p.id === product.id)) {
      setCompareItems([...compareItems, product]);
    }
    setIsModalOpen(false);
  };

  // Helper to check if a value is the best among the compared items
  const isBestValue = (key: string, value: any, items: any[]) => {
    if (key === 'price') {
      const minPrice = Math.min(...items.map(i => i.price));
      return value === minPrice;
    }
    if (key === 'rating') {
      const maxRating = Math.max(...items.map(i => i.rating));
      return value === maxRating;
    }
    return false;
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">So sánh sản phẩm</h1>

      {compareItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 mb-6">Chưa có sản phẩm nào để so sánh.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Thêm sản phẩm
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-8">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="w-48 p-4 text-left font-medium text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  Sản phẩm
                </th>
                {compareItems.map(item => (
                  <th key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-800 relative align-top w-1/3">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiX />
                    </button>
                    <div className="flex flex-col items-center text-center mt-4">
                      <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-xl mb-4" />
                      <Link to={`/product/${item.id}`} className="font-bold text-lg hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                        {item.name}
                      </Link>
                      <div className="text-xl font-bold text-purple-600 mb-4">
                        {formatPrice(item.price)}
                      </div>
                      <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <FiShoppingCart /> Thêm vào giỏ
                      </button>
                    </div>
                  </th>
                ))}
                {compareItems.length < 3 && (
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 align-middle">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
                    >
                      <FiPlus className="text-4xl mb-2" />
                      <span className="font-medium">Thêm sản phẩm</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Specs Rows */}
              {[
                { label: 'Thương hiệu', key: 'brand' },
                { label: 'Đánh giá', key: 'rating' },
                { label: 'CPU', key: 'cpu', isSpec: true },
                { label: 'RAM', key: 'ram', isSpec: true },
                { label: 'Lưu trữ', key: 'storage', isSpec: true },
                { label: 'Màn hình', key: 'screen', isSpec: true },
                { label: 'Pin', key: 'battery', isSpec: true },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-500">{row.label}</td>
                  {compareItems.map(item => {
                    const value = row.isSpec ? item.specs[row.key] : item[row.key];
                    const isBest = isBestValue(row.key, value, compareItems);
                    
                    return (
                      <td 
                        key={`${item.id}-${row.key}`} 
                        className={`p-4 text-center ${isBest ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 font-medium' : ''}`}
                      >
                        {row.key === 'rating' ? (
                          <div className="flex items-center justify-center gap-1">
                            {value} <FiStar className="text-yellow-400 fill-yellow-400" />
                          </div>
                        ) : (
                          value || '-'
                        )}
                      </td>
                    );
                  })}
                  {compareItems.length < 3 && <td></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Chọn sản phẩm để so sánh</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {mockProducts.map(product => {
                const isSelected = compareItems.find(p => p.id === product.id);
                return (
                  <div 
                    key={product.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 cursor-pointer'}`}
                    onClick={() => !isSelected && addItem(product)}
                  >
                    <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{product.name}</h4>
                      <p className="text-purple-600 font-bold">{formatPrice(product.price)}</p>
                    </div>
                    {isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                        <FiCheck />
                      </div>
                    ) : (
                      <button className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:border-purple-500 hover:text-purple-500">
                        <FiPlus />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
