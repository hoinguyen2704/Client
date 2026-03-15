import { useState } from 'react';
import { FiCheck, FiMapPin, FiCreditCard, FiTruck, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { mockProducts } from '@/utils/mockData';
import { formatPrice } from '@/helpers/format';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const steps = [
  { id: 1, title: 'Thông tin giao hàng', icon: FiMapPin },
  { id: 2, title: 'Xác nhận đơn hàng', icon: FiTruck },
  { id: 3, title: 'Thanh toán', icon: FiCreditCard },
];

export default function Checkout() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Use item passed from ProductDetail if available, otherwise use mock cart
  const cartItems = location.state?.buyNowItem 
    ? [location.state.buyNowItem] 
    : [
        { ...mockProducts[0], quantity: 1, selectedVariant: '8GB', selectedColor: 'Đen' },
        { ...mockProducts[1], quantity: 2, selectedVariant: '16GB', selectedColor: 'Trắng' },
      ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  const total = subtotal + shipping;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Simulate payment processing
      setTimeout(() => {
        setIsSuccess(Math.random() > 0.2); // 80% success rate for demo
      }, 1500);
    }
  };

  if (isSuccess !== null) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center"
        >
          {isSuccess ? (
            <>
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <FiCheck className="text-5xl text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Cảm ơn bạn đã mua sắm tại Hozitech. Mã đơn hàng của bạn là <span className="font-bold text-slate-900 dark:text-white">#HZT-889922</span>.
              </p>
              <Link to="/user/tracking" className="block w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all mb-4">
                Theo dõi đơn hàng
              </Link>
              <Link to="/" className="block w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Tiếp tục mua sắm
              </Link>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                <FiAlertCircle className="text-5xl text-red-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Thanh toán thất bại</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Đã có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
              </p>
              <button 
                onClick={() => setIsSuccess(null)}
                className="block w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all mb-4"
              >
                Thử lại
              </button>
              <Link to="/cart" className="block w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Quay lại giỏ hàng
              </Link>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold z-10 transition-colors ${currentStep >= step.id ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                {currentStep > step.id ? <FiCheck /> : <step.icon />}
              </div>
              <span className={`absolute top-14 w-32 text-center text-sm font-medium ${currentStep >= step.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 md:w-32 h-1 mx-2 rounded-full transition-colors ${currentStep > step.id ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-16">
        {/* Main Content */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8"
            >
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Thông tin giao hàng</h2>
                  
                  <div className="mb-8 p-4 rounded-2xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/10 relative">
                    <div className="absolute top-4 right-4 text-purple-600 font-medium cursor-pointer hover:underline">Thay đổi</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">Nguyễn Văn A</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600 dark:text-slate-400">0987654321</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh</p>
                    <div className="mt-3 inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-md">Mặc định</div>
                  </div>

                  <h3 className="font-bold mb-4">Hoặc nhập địa chỉ mới</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Họ và tên" className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                    <input type="tel" placeholder="Số điện thoại" className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                    <input type="text" placeholder="Tỉnh/Thành phố" className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                    <input type="text" placeholder="Quận/Huyện" className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                    <input type="text" placeholder="Phường/Xã" className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                    <input type="text" placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Xác nhận đơn hàng</h2>
                  
                  <div className="space-y-4 mb-8">
                    {cartItems.map((item, idx) => (
                      <div key={item.id || idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2 mb-1">{item.name}</h4>
                          <div className="text-sm text-slate-500 mb-2">
                            Phân loại: {item.selectedColor || 'Mặc định'}
                            {item.selectedVariant ? `, ${item.selectedVariant}` : ''}
                            {item.selectedStorage ? `, ${item.selectedStorage}` : ''}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-600">{formatPrice(item.price)}</span>
                            <span className="text-slate-500 font-medium">x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold mb-2">Ghi chú cho đơn hàng</h3>
                    <textarea 
                      rows={3} 
                      placeholder="Nhập ghi chú (nếu có)..."
                      className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>
                  
                  <div className="space-y-4">
                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-purple-600 focus:ring-purple-500" />
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl"><FiTruck /></div>
                      <div>
                        <h4 className="font-bold">Thanh toán khi nhận hàng (COD)</h4>
                        <p className="text-sm text-slate-500">Thanh toán bằng tiền mặt khi giao hàng</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'banking' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="w-5 h-5 text-purple-600 focus:ring-purple-500" />
                      <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-2xl"><FiCreditCard /></div>
                      <div>
                        <h4 className="font-bold">Chuyển khoản ngân hàng</h4>
                        <p className="text-sm text-slate-500">Chuyển khoản qua mã QR hoặc STK</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-5 h-5 text-purple-600 focus:ring-purple-500" />
                      <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl"><FiCreditCard /></div>
                      <div>
                        <h4 className="font-bold">Ví điện tử (Momo, ZaloPay)</h4>
                        <p className="text-sm text-slate-500">Thanh toán nhanh chóng qua ví điện tử</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sticky top-28">
            <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(shipping)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Tổng thanh toán</span>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {currentStep > 1 && (
                <button 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="w-1/3 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Quay lại
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                {currentStep === 3 ? 'Đặt hàng ngay' : 'Tiếp tục'} <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
