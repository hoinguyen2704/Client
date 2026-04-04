import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components';

interface CheckoutResultProps {
  isSuccess: boolean;
  onRetry: () => void;
}

export default function CheckoutResult({ isSuccess, onRetry }: CheckoutResultProps) {
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
            <Button href="/user/tracking" fullWidth size="lg" className="mb-4">
              Theo dõi đơn hàng
            </Button>
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
              onClick={onRetry}
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
