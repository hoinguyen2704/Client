import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiCheck, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { Button } from '@/components';
import { formatPrice } from '@/utils/format';
import { setDocumentTitle } from '@/utils/helpers';

export default function VnpayReturn() {
  const { t } = useTranslation('checkout');
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
    setDocumentTitle(t('vnpayReturn.documentTitle'));
    
    // Verify parameters existence
    if (!txnRef || !responseCode) {
      setStatus('FAILED');
      setMessage(t('vnpayReturn.errors.missingTransaction'));
      return;
    }

    // According to VNPAY docs, response code 00 means success
    if (responseCode === '00') {
      setStatus('SUCCESS');
      setMessage(t('vnpayReturn.errors.success'));
    } else {
      setStatus('FAILED');
      // Look up some common error codes for better display
      if (responseCode === '24') {
        setMessage(t('vnpayReturn.errors.cancelled'));
      } else if (responseCode === '51') {
        setMessage(t('vnpayReturn.errors.insufficientFunds'));
      } else if (responseCode === '65') {
        setMessage(t('vnpayReturn.errors.dailyLimitExceeded'));
      } else {
        setMessage(t('vnpayReturn.errors.failed'));
      }
    }
  }, [txnRef, responseCode, t]);

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
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 dark:text-white">{t('vnpayReturn.success.title')}</h1>
            <p className="text-md sm:text-base text-slate-500 dark:text-slate-400 mb-2">
              <Trans
                i18nKey="checkout:vnpayReturn.success.orderCode"
                values={{ txnRef }}
                components={{ strong: <span className="font-bold text-slate-900 dark:text-white" /> }}
              />
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-5 text-md text-left space-y-2 border border-slate-100 dark:border-slate-700 w-full inline-block">
                <div className="flex justify-between">
                    <span className="text-slate-500">{t('vnpayReturn.success.amount')}:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{formatPrice(amount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">{t('vnpayReturn.success.bank')}:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{bankCode || 'VNPAY'}</span>
                </div>
            </div>
            <Button
              href={`/user/orders/${txnRef}`}
              fullWidth
              size="lg"
              className="mb-3 sm:mb-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {t('vnpayReturn.success.trackOrder')}
            </Button>
            <Link to="/" className="block w-full py-3.5 sm:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center">
              {t('vnpayReturn.success.continueShopping')}
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiAlertCircle className="text-4xl sm:text-5xl text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 dark:text-white">{t('vnpayReturn.failed.title')}</h1>
            <p className="text-md sm:text-base text-slate-500 dark:text-slate-400 mb-5 sm:mb-6">
              {t('vnpayReturn.failed.description', { message })}
            </p>
            {txnRef && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 mb-5 text-md text-left space-y-1 border border-red-100 dark:border-red-900/50">
                  <div className="flex justify-between">
                      <span className="text-red-500 font-medium whitespace-nowrap mr-2">{t('vnpayReturn.failed.orderCode')}:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{txnRef}</span>
                  </div>
              </div>
            )}
            <button 
              onClick={handleRetry}
              className="block w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all mb-3 sm:mb-4 flex items-center justify-center gap-2"
            >
              <FiCreditCard /> {t('vnpayReturn.failed.retry')}
            </button>
            <Link to="/cart" className="block w-full py-3.5 sm:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center">
              {t('vnpayReturn.failed.backToCart')}
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
