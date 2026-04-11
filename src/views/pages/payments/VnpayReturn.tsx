import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiCheck, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { Button } from '@/components';
import { setDocumentTitle } from '@/utils/helpers';

export default function VnpayReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING');
  const [message, setMessage] = useState('');
  
  const txnRef = searchParams.get('vnp_TxnRef');
  const responseCode = searchParams.get('vnp_ResponseCode');
  const bankCode = searchParams.get('vnp_BankCode');
  const amountStr = searchParams.get('vnp_Amount');
  const amount = amountStr ? parseInt(amountStr) / 100 : 0;

  useEffect(() => {
    setDocumentTitle('Kết quả thanh toán VNPAY');
    
    // Verify parameters existence
    if (!txnRef || !responseCode) {
      setStatus('FAILED');
      setMessage('Không tìm thấy thông tin giao dịch.');
      return;
    }

    // According to VNPAY docs, response code 00 means success
    if (responseCode === '00') {
      setStatus('SUCCESS');
      setMessage('Giao dịch thanh toán VNPAY thành công.');
    } else {
      setStatus('FAILED');
      // Look up some common error codes for better display
      if (responseCode === '24') {
        setMessage('Bạn đã hủy giao dịch.');
      } else if (responseCode === '51') {
        setMessage('Tài khoản không đủ số dư để thực hiện giao dịch.');
      } else if (responseCode === '65') {
        setMessage('Khách hàng vượt quá hạn mức giao dịch trong ngày.');
      } else {
        setMessage('Thanh toán thất bại. Lỗi từ phía ngân hàng hoặc VNPAY.');
      }
    }
  }, [txnRef, responseCode]);

  const handleRetry = () => {
    navigate('/cart');
  };

  if (status === 'LOADING') {
    return (
      <div className="w-full flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 py-10 sm:py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center"
      >
        {status === 'SUCCESS' ? (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiCheck className="text-4xl sm:text-5xl text-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 dark:text-white">Đặt hàng thành công!</h1>
            <p className="text-md sm:text-base text-slate-500 dark:text-slate-400 mb-2">
              Mã đơn hàng của bạn là <span className="font-bold text-slate-900 dark:text-white">#{txnRef}</span>.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-5 text-md text-left space-y-2 border border-slate-100 dark:border-slate-700 w-full inline-block">
                <div className="flex justify-between">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{bankCode || 'VNPAY'}</span>
                </div>
            </div>
            <Button
              href={`/user/orders/${txnRef}`}
              fullWidth
              size="lg"
              className="mb-3 sm:mb-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Theo dõi đơn hàng
            </Button>
            <Link to="/" className="block w-full py-3.5 sm:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center">
              Tiếp tục mua sắm
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiAlertCircle className="text-4xl sm:text-5xl text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 dark:text-white">Thanh toán thất bại</h1>
            <p className="text-md sm:text-base text-slate-500 dark:text-slate-400 mb-5 sm:mb-6">
              {message} Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>
            {txnRef && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 mb-5 text-md text-left space-y-1 border border-red-100 dark:border-red-900/50">
                  <div className="flex justify-between">
                      <span className="text-red-500 font-medium whitespace-nowrap mr-2">Mã đơn hàng:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{txnRef}</span>
                  </div>
              </div>
            )}
            <button 
              onClick={handleRetry}
              className="block w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all mb-3 sm:mb-4 flex items-center justify-center gap-2"
            >
              <FiCreditCard /> Thanh toán lại
            </button>
            <Link to="/cart" className="block w-full py-3.5 sm:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center">
              Quay lại giỏ hàng
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
