import { useState } from 'react';
import { FiTrash2, FiTag, FiChevronRight, FiMinus, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import { mockProducts } from '@/utils/mockData';
import { formatPrice } from '@/helpers/format';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    { ...mockProducts[0], quantity: 1, selected: true },
    { ...mockProducts[1], quantity: 2, selected: false },
  ]);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<{code: string, discount: number} | null>(null);

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(cartItems.map(item => ({ ...item, selected: !allSelected })));
  };

  const toggleSelect = (id: string) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = selectedVoucher ? (subtotal * selectedVoucher.discount / 100) : 0;
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal - discount + shipping;

  const vouchers = [
    { code: 'HOZITECH50', desc: 'Giảm 50% tối đa 100k', discount: 50, min: 200000, expires: '2 giờ nữa' },
    { code: 'FREESHIP', desc: 'Miễn phí vận chuyển', discount: 0, min: 150000, expires: '1 ngày nữa' },
    { code: 'TECH10', desc: 'Giảm 10% cho đồ công nghệ', discount: 10, min: 500000, expires: '3 ngày nữa' },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 mb-6">Giỏ hàng trống.</p>
          <Link to="/" className="btn btn-primary btn-md">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium">Chọn tất cả ({cartItems.length})</span>
                </label>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 flex gap-4 items-start"
                    >
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-2"
                      />
                      
                      <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                      
                      <div className="flex-1 flex flex-col h-24">
                        <Link to={`/product/${item.slug}`} className="font-medium line-clamp-2 hover:text-purple-600 transition-colors mb-1">
                          {item.name}
                        </Link>
                        <div className="text-sm text-slate-500 mb-auto">Phân loại: Đen, 8GB</div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="font-bold text-purple-600 text-lg">{formatPrice(item.price)}</div>
                          
                          <div className="flex items-center gap-3 sm:gap-6">
                            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95"
                              >
                                <FiMinus />
                              </button>
                              <input 
                                type="text" 
                                value={item.quantity} 
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) updateQuantity(item.id, val);
                                }}
                                className="w-10 h-8 text-center border-none bg-transparent font-bold text-sm focus:ring-0 p-0"
                              />
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95"
                              >
                                <FiPlus />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all"
                            >
                              <FiTrash2 className="text-lg" />
                              <span className="hidden sm:inline">Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-6">Tổng đơn hàng</h2>
              
              {/* Voucher Selector */}
              <div className="mb-6">
                <button 
                  onClick={() => setIsVoucherOpen(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FiTag className="text-purple-600 text-xl" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">
                      {selectedVoucher ? selectedVoucher.code : 'Chọn Voucher'}
                    </span>
                  </div>
                  <FiChevronRight className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>

              {/* Summary Details */}
              <div className="space-y-4 mb-6 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(shipping)}</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Giảm giá ({selectedVoucher.code})</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">Tổng thanh toán</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#2539e6] dark:text-blue-400">
                      {formatPrice(total)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">(Đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                disabled={selectedItems.length === 0}
                className="w-full py-4 rounded-xl bg-[#6338f0] hover:bg-[#5028d0] text-white font-bold text-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Tiến hành thanh toán <FiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      <AnimatePresence>
        {isVoucherOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold">Chọn Voucher</h2>
                <button onClick={() => setIsVoucherOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Nhập mã voucher..." 
                    className="flex-1 h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button className="px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 transition-colors">
                    Áp dụng
                  </button>
                </div>

                {vouchers.map((voucher, idx) => {
                  const isEligible = subtotal >= voucher.min;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${!isEligible ? 'opacity-50 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50' : selectedVoucher?.code === voucher.code ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 cursor-pointer'}`}
                      onClick={() => isEligible && setSelectedVoucher(voucher)}
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shrink-0">
                        <FiTag className="text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{voucher.code}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{voucher.desc}</p>
                        <p className="text-xs text-red-500 font-medium">Hết hạn trong: {voucher.expires}</p>
                      </div>
                      {isEligible && (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedVoucher?.code === voucher.code ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-300'}`}>
                          {selectedVoucher?.code === voucher.code && <FiCheck className="text-sm" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setIsVoucherOpen(false)}
                  className="btn btn-primary w-full py-4"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
