import { useState } from 'react';
import { FiCreditCard, FiTruck } from 'react-icons/fi';
import { mockProducts } from '@/__mocks__/mockData';
import { formatPrice } from '@/helpers/format';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import CheckoutResult from './CheckoutResult';
import CheckoutStepper from './CheckoutStepper';
import OrderSummary from './OrderSummary';

export default function Checkout() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const cartItems = location.state?.buyNowItem 
    ? [location.state.buyNowItem] 
    : [
        { ...mockProducts[0], quantity: 1, selectedVariant: '8GB', selectedColor: 'Đen' },
        { ...mockProducts[1], quantity: 2, selectedVariant: '16GB', selectedColor: 'Trắng' },
      ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setTimeout(() => {
        setIsSuccess(Math.random() > 0.2);
      }, 1500);
    }
  };

  if (isSuccess !== null) {
    return <CheckoutResult isSuccess={isSuccess} onRetry={() => setIsSuccess(null)} />;
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>
      <CheckoutStepper currentStep={currentStep} />

      <div className="flex flex-col lg:flex-row gap-8 mt-16">
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
                    {cartItems.map((item: any, idx: number) => (
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
                    {[
                      { id: 'cod', icon: FiTruck, bg: 'bg-blue-100 text-blue-600', title: 'Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi giao hàng' },
                      { id: 'banking', icon: FiCreditCard, bg: 'bg-green-100 text-green-600', title: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản qua mã QR hoặc STK' },
                      { id: 'wallet', icon: FiCreditCard, bg: 'bg-pink-100 text-pink-600', title: 'Ví điện tử (Momo, ZaloPay)', desc: 'Thanh toán nhanh chóng qua ví điện tử' },
                    ].map((method) => (
                      <label key={method.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="w-5 h-5 text-purple-600 focus:ring-purple-500" />
                        <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center text-2xl`}><method.icon /></div>
                        <div>
                          <h4 className="font-bold">{method.title}</h4>
                          <p className="text-sm text-slate-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:w-1/3">
          <OrderSummary
            cartItems={cartItems}
            currentStep={currentStep}
            onBack={() => setCurrentStep(currentStep - 1)}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}
