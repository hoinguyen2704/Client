import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FiAlertCircle, FiCheckCircle, FiClipboard, FiClock, FiCreditCard, FiPackage } from 'react-icons/fi';
import { Button } from '@/components';
import orderService from '@/apis/services/orderService';
import settingService from '@/apis/services/settingService';
import type { BankTransferConfig, OrderResponse } from '@/types';
import { formatPrice } from '@/utils/format';
import { setDocumentTitle } from '@/utils/helpers';

interface CopyRowProps {
  label: string;
  value?: string;
  copyLabel: string;
  onCopy: (value?: string) => void;
  accent?: boolean;
}

function CopyRow({ label, value, copyLabel, onCopy, accent = false }: CopyRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-sm font-semibold uppercase tracking-wide text-muted">{label}</div>
        <div className={`mt-1 break-words text-base font-bold ${accent ? 'text-blue-600' : 'text-ink'}`}>
          {value || '-'}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value)}
        disabled={!value}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-body transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
      >
        <FiClipboard />
        {copyLabel}
      </button>
    </div>
  );
}

export default function BankTransferPayment() {
  const { t } = useTranslation('checkout');
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [bankConfig, setBankConfig] = useState<BankTransferConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setDocumentTitle(t('bankTransfer.documentTitle'));
  }, [t]);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setLoadError(true);
      return;
    }

    setLoading(true);
    Promise.all([
      orderService.getByNumber(orderNumber),
      settingService.getBankTransfer(),
    ])
      .then(([orderRes, bankRes]) => {
        setOrder(orderRes.data || null);
        setBankConfig(bankRes.data || null);
      })
      .catch(() => {
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const transferContent = useMemo(() => (
    order?.orderNumber ? t('bankTransfer.contentValue', { orderNumber: order.orderNumber }) : ''
  ), [order?.orderNumber, t]);

  const missingBankConfig = !bankConfig?.bankName || !bankConfig?.accountNumber || !bankConfig?.accountName;
  const invalidOrder = Boolean(order && order.paymentMethod !== 'BANK_TRANSFER');

  const copyValue = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('bankTransfer.copySuccess'));
    } catch {
      toast.error(t('bankTransfer.copyFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="w-full px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <FiAlertCircle className="mx-auto mb-4 text-5xl text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-ink">{t('bankTransfer.notFound.title')}</h1>
          <p className="mb-6 text-muted">{t('bankTransfer.notFound.description')}</p>
          <Button href="/user/orders" fullWidth>{t('bankTransfer.notFound.action')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 px-3 py-8 dark:bg-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-[1000px] min-w-[1000px] grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <FiClock />
                {t('bankTransfer.pendingBadge')}
              </div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">{t('bankTransfer.title')}</h1>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{t('bankTransfer.description')}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-left dark:bg-slate-800">
              <div className="text-sm font-semibold uppercase tracking-wide text-muted">{t('bankTransfer.orderCode')}: <span className="mt-1 font-mono text-lg font-bold text-ink">{order.orderNumber}</span></div>

            </div>
          </div>

          <div className="grid gap-3">
            <CopyRow label={t('bankTransfer.amount')} value={formatPrice(order.totalAmount)} copyLabel={t('bankTransfer.copy')} onCopy={() => copyValue(String(Math.round(order.totalAmount)))} accent />
            <CopyRow label={t('bankTransfer.content')} value={transferContent} copyLabel={t('bankTransfer.copy')} onCopy={copyValue} accent />
            <CopyRow label={t('bankTransfer.bankName')} value={bankConfig?.bankName} copyLabel={t('bankTransfer.copy')} onCopy={copyValue} />
            <CopyRow label={t('bankTransfer.accountNumber')} value={bankConfig?.accountNumber} copyLabel={t('bankTransfer.copy')} onCopy={copyValue} />
            <CopyRow label={t('bankTransfer.accountName')} value={bankConfig?.accountName} copyLabel={t('bankTransfer.copy')} onCopy={copyValue} />
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
            {bankConfig?.instructions || t('bankTransfer.instructionsFallback')}
          </div>
        </section>

        <aside className="grid grid-cols-1 gap-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl text-blue-600 dark:bg-slate-800">
                <FiCreditCard />
              </div>
              <div>
                <h2 className="font-bold text-ink">{t('bankTransfer.qrTitle')}</h2>
                <p className="text-sm text-muted">{t('bankTransfer.qrSubtitle')}</p>
              </div>
            </div>
            {bankConfig?.qrImageUrl ? (
              <img
                src={bankConfig.qrImageUrl}
                alt={t('bankTransfer.qrAlt')}
                className="aspect-square w-full rounded-xl border border-slate-100 object-contain p-3 dark:border-slate-800"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-muted dark:border-slate-700 dark:bg-slate-800/60">
                {t('bankTransfer.qrMissing')}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2 text-emerald-600">
              <FiCheckCircle className="text-xl" />
              <span className="font-bold">{t('bankTransfer.nextTitle')}</span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted">{t('bankTransfer.nextDescription')}</p>
            <Button href={`/user/orders/${order.orderNumber}`} fullWidth icon={<FiPackage />} className="mb-3">
              {t('bankTransfer.viewOrder')}
            </Button>
            <Link to="/" className="block w-full rounded-xl bg-slate-100 py-3 text-center font-bold text-ink transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
              {t('bankTransfer.continueShopping')}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
