import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiAlertCircle, FiCheck, FiPackage } from 'react-icons/fi';
import { Button } from '@/components';
import paymentService, { type MomoReturnPayload } from '@/apis/services/paymentService';
import { formatPrice } from '@/utils/format';
import { setDocumentTitle } from '@/utils/helpers';

const parseNumberParam = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildMomoReturnPayload = (searchParams: URLSearchParams): MomoReturnPayload => ({
  partnerCode: searchParams.get('partnerCode'),
  orderId: searchParams.get('orderId'),
  requestId: searchParams.get('requestId'),
  amount: parseNumberParam(searchParams.get('amount')),
  orderInfo: searchParams.get('orderInfo'),
  orderType: searchParams.get('orderType'),
  transId: parseNumberParam(searchParams.get('transId')),
  resultCode: parseNumberParam(searchParams.get('resultCode')),
  message: searchParams.get('message'),
  payType: searchParams.get('payType'),
  responseTime: parseNumberParam(searchParams.get('responseTime')),
  extraData: searchParams.get('extraData') || '',
  signature: searchParams.get('signature'),
  paymentOption: searchParams.get('paymentOption'),
  userFee: parseNumberParam(searchParams.get('userFee')),
});

export default function MomoReturn() {
  const { t } = useTranslation('checkout');
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING');
  const [message, setMessage] = useState('');

  const searchKey = searchParams.toString();
  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');
  const payType = searchParams.get('payType');
  const amountStr = searchParams.get('amount');
  const amount = amountStr ? parseInt(amountStr, 10) : 0;

  useEffect(() => {
    let active = true;
    let callbackFailed = false;
    setDocumentTitle(t('momoReturn.documentTitle'));

    const finalizeDisplay = () => {
      if (!active) return;
      if (!orderId || !resultCode) {
        setStatus('FAILED');
        setMessage(t('momoReturn.errors.missingTransaction'));
        return;
      }

      if (resultCode === '0') {
        setStatus('SUCCESS');
        setMessage(t('momoReturn.errors.success'));
        return;
      }

      setStatus('FAILED');
      if (callbackFailed) {
        setMessage(t('momoReturn.errors.cancelFailed'));
      } else if (resultCode === '1006') {
        setMessage(t('momoReturn.errors.cancelled'));
      } else if (resultCode === '1005') {
        setMessage(t('momoReturn.errors.expired'));
      } else {
        setMessage(t('momoReturn.errors.failed'));
      }
    };

    if (!orderId || !resultCode) {
      finalizeDisplay();
      return () => { active = false; };
    }

    paymentService.processMomoReturn(buildMomoReturnPayload(new URLSearchParams(searchKey)))
      .catch(() => {
        callbackFailed = true;
      })
      .finally(finalizeDisplay);

    return () => { active = false; };
  }, [orderId, resultCode, searchKey, t]);

  if (status === 'LOADING') {
    return (
      <div className="w-full flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-ink">{t('momoReturn.success.title')}</h1>
            <p className="text-md sm:text-base text-muted mb-2">
              <Trans
                i18nKey="checkout:momoReturn.success.orderCode"
                values={{ orderId }}
                components={{ strong: <span className="font-bold text-ink" /> }}
              />
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-5 text-md text-left space-y-2 border border-slate-100 dark:border-slate-700 w-full inline-block">
              <div className="flex justify-between">
                <span className="text-muted">{t('momoReturn.success.amount')}:</span>
                <span className="font-bold text-ink">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t('momoReturn.success.wallet')}:</span>
                <span className="font-medium text-ink">{payType || 'MoMo'}</span>
              </div>
            </div>
            <Button
              href={`/user/orders/${orderId}`}
              fullWidth
              size="lg"
              className="mb-3 sm:mb-4 bg-pink-600 hover:bg-pink-700 text-white"
            >
              {t('momoReturn.success.trackOrder')}
            </Button>
            <Link to="/" className="block w-full py-3.5 sm:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-ink font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center">
              {t('momoReturn.success.continueShopping')}
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiAlertCircle className="text-4xl sm:text-5xl text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-ink">{t('momoReturn.failed.title')}</h1>
            <p className="text-md sm:text-base text-muted mb-5 sm:mb-6">
              {t('momoReturn.failed.description', { message })}
            </p>
            {orderId && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 mb-5 text-md text-left space-y-1 border border-red-100 dark:border-red-900/50">
                <div className="flex justify-between">
                  <span className="text-red-500 font-medium whitespace-nowrap mr-2">{t('momoReturn.failed.orderCode')}:</span>
                  <span className="font-mono text-body truncate">{orderId}</span>
                </div>
              </div>
            )}
            {orderId && (
              <Button
                href={`/user/orders/${orderId}`}
                fullWidth
                size="lg"
                icon={<FiPackage />}
                className="mb-3 sm:mb-4 bg-slate-900 hover:bg-blue-600 text-white"
              >
                {t('momoReturn.failed.viewOrder')}
              </Button>
            )}
            <Link to="/" className="block w-full py-3.5 sm:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-ink font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center">
              {t('momoReturn.failed.continueShopping')}
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
