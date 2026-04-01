import { formatPrice } from '@/utils/format';
import { FiChevronRight } from 'react-icons/fi';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
}

export default function OrderSummary({ cartItems, currentStep, onBack, onNext }: OrderSummaryProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  const total = subtotal + shipping;

  return (
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
            onClick={onBack}
            className="w-1/3 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Quay lại
          </button>
        )}
        <button 
          onClick={onNext}
          className="btn btn-primary flex-1 py-4 gap-2"
        >
          {currentStep === 3 ? 'Đặt hàng ngay' : 'Tiếp tục'} <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
