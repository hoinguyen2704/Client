import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiPackage,
  FiRotateCw,
  FiXCircle,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BackButton, Button, CustomSelect } from '@/components';
import returnService from '@/apis/services/returnService';
import {
  RETURN_STATUS_TRANSITIONS,
  canProcessRefund,
  ReturnStatusBadge,
  RefundStatusBadge,
  getReturnStatusMeta,
  type ReturnStatus,
} from '@/constants/returnConstants';
import { formatDateFull as formatDateTime, formatPrice } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/error';
import type { ProcessRefundRequestPayload, ReturnRequestResponse, ReviewReturnRequestPayload } from '@/types';



const createIdempotencyKey = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `refund-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function ReturnDetail() {
  const { t } = useTranslation(['adminSales', 'common']);
  const { id } = useParams<{ id: string }>();
  const [returnRequest, setReturnRequest] = useState<ReturnRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviewNote, setReviewNote] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const [nextStatus, setNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [refundAmount, setRefundAmount] = useState('');
  const [refundProvider, setRefundProvider] = useState('MANUAL');
  const [transactionId, setTransactionId] = useState('');
  const [refundAdminNote, setRefundAdminNote] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [rawPayload, setRawPayload] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    returnService.adminGetByNumber(id)
      .then((res) => {
        setReturnRequest(res.data);
        setNextStatus(res.data.status);
      })
      .catch(() => {
        setReturnRequest(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusOptions = useMemo(() => {
    if (!returnRequest) return [];
    const currentStatus = returnRequest.status as ReturnStatus;
    const transitions = RETURN_STATUS_TRANSITIONS[currentStatus] || [];
    const uniqueStatuses = [currentStatus, ...transitions];
    return uniqueStatuses.map((status) => {
      const meta = getReturnStatusMeta(status, t);
      return {
        value: status,
        label: meta.label,
        colorClass: meta.className,
      };
    });
  }, [returnRequest, t]);

  const allowReview = returnRequest?.status === 'REQUESTED';
  const allowRefund = !!returnRequest && canProcessRefund(returnRequest.status) && returnRequest.refundStatus !== 'SUCCESS';
  const timelineHistories = useMemo(() => {
    if (!returnRequest) return [];

    const histories = returnRequest.statusHistories ? [...returnRequest.statusHistories] : [];
    const hasRequestedStatus = histories.some((history) => history.status === 'REQUESTED');

    if (!hasRequestedStatus) {
      histories.push({
        id: `requested-${returnRequest.id}`,
        status: 'REQUESTED',
        description: t('returns.detail.timelineRequested'),
        createdAt: returnRequest.createdAt,
      });
    }

    return histories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [returnRequest, t]);

  const applyUpdatedReturn = (updated: ReturnRequestResponse) => {
    setReturnRequest(updated);
    setNextStatus(updated.status);
  };

  const handleReview = async (approved: boolean) => {
    if (!returnRequest) return;
    const payload: ReviewReturnRequestPayload = {
      approved,
      note: reviewNote.trim() || undefined,
    };
    if (approved && approvedAmount.trim()) {
      const numericAmount = Number(approvedAmount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        toast.error(t('returns.detail.toasts.invalidApprovedAmount'));
        return;
      }
      payload.approvedAmount = numericAmount;
    }

    setIsReviewing(true);
    try {
      const res = await returnService.adminReview(returnRequest.id, payload);
      applyUpdatedReturn(res.data);
      setReviewNote('');
      setApprovedAmount('');
      toast.success(
        approved
          ? t('returns.detail.toasts.reviewApproved')
          : t('returns.detail.toasts.reviewRejected'),
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, translate, 'common:errors.reviewReturnFailed'));
    } finally {
      setIsReviewing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!returnRequest) return;
    if (!nextStatus || nextStatus === returnRequest.status) {
      toast.error(t('returns.detail.toasts.selectStatus'));
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await returnService.adminUpdateStatus(returnRequest.id, {
        status: nextStatus,
        note: statusNote.trim() || undefined,
      });
      applyUpdatedReturn(res.data);
      setStatusNote('');
      toast.success(t('returns.detail.toasts.statusUpdated'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, translate, 'common:errors.updateStatusFailed'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!returnRequest) return;

    if (!refundAmount.trim()) {
      toast.error(t('returns.detail.toasts.refundAmountRequired'));
      return;
    }
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t('returns.detail.toasts.invalidRefundAmount'));
      return;
    }

    const provider = refundProvider.trim().toUpperCase();
    if (!provider) {
      toast.error(t('returns.detail.toasts.refundProviderRequired'));
      return;
    }

    const normalizedTransactionId = transactionId.trim();
    if (!normalizedTransactionId) {
      toast.error(t('returns.detail.toasts.refundTransactionRequired'));
      return;
    }

    const adminNote = refundAdminNote.trim();
    if (!adminNote) {
      toast.error(t('returns.detail.toasts.refundAdminNoteRequired'));
      return;
    }

    const payload: ProcessRefundRequestPayload = {
      amount,
      provider,
      transactionId: normalizedTransactionId,
      adminNote,
      currency: currency.trim() || undefined,
      rawPayload: rawPayload.trim() || undefined,
    };

    setIsRefunding(true);
    try {
      const res = await returnService.adminProcessRefund(returnRequest.id, payload, createIdempotencyKey());
      applyUpdatedReturn(res.data);
      setRefundAmount('');
      setTransactionId('');
      setRefundAdminNote('');
      setRawPayload('');
      toast.success(t('returns.detail.toasts.refundSuccess'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, translate, 'common:errors.processRefundFailed'));
    } finally {
      setIsRefunding(false);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 animate-pulse space-y-3">
          <div className="h-5 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="space-y-4">
        <BackButton to="/admin/returns" />
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400">
          {t('returns.detail.notFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <BackButton to="/admin/returns" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
              {returnRequest.returnNumber}
              <ReturnStatusBadge status={returnRequest.status} />
            </h1>
            <p className="text-slate-500 text-md mt-1">
              {t('returns.detail.orderLabel')}: <span className="font-semibold text-slate-700 dark:text-slate-200">{returnRequest.orderNumber}</span> | {t('returns.detail.createdAtLabel')}{' '}
              {formatDateTime(returnRequest.createdAt)}
            </p>
          </div>
        </div>
        <div><RefundStatusBadge status={returnRequest.refundStatus} /></div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 items-start">
        <div className="flex-1 w-full min-w-0 space-y-4 sm:space-y-6">
          {/* Vertical Timeline History */}
          {timelineHistories.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative">
                {timelineHistories.map((history, idx) => {
                  const time = new Date(history.createdAt);
                  const isFirst = idx === 0;
                  const isLast = idx === timelineHistories.length - 1;

                  return (
                    <div key={history.id} className="flex gap-4">
                      {/* Left: Time */}
                      <div className="w-20 sm:w-24 flex-shrink-0 text-right pt-1">
                        <div className="text-md font-medium text-slate-800 dark:text-slate-200">
                          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {time.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Middle: Line & Dot */}
                      <div className="relative flex flex-col items-center">
                        {!isFirst && <div className="absolute top-0 -mt-6 w-px h-6 bg-slate-200 dark:bg-slate-700" />}

                        <div className={`w-3 h-3 rounded-full z-10 mt-2 ${isFirst ? 'bg-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30' : 'bg-slate-300 dark:bg-slate-600'}`} />

                        {!isLast && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-2" />}
                      </div>

                      {/* Right: Content */}
                      <div className="pb-8 pt-1 flex-1">
                        <h4 className={`text-base font-medium ${isFirst ? 'text-purple-600' : 'text-slate-600 dark:text-slate-400'}`}>
                          {history.description}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FiPackage className="text-purple-600" />
              {t('returns.detail.itemsTitle')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                    <th className="pb-3 font-medium">{t('returns.detail.table.product')}</th>
                    <th className="pb-3 font-medium">{t('returns.detail.table.variant')}</th>
                    <th className="pb-3 font-medium text-right">{t('returns.detail.table.unitPrice')}</th>
                    <th className="pb-3 font-medium text-center">{t('returns.detail.table.requestedQty')}</th>
                    <th className="pb-3 font-medium text-center">{t('returns.detail.table.approvedQty')}</th>
                    <th className="pb-3 font-medium text-right">{t('returns.detail.table.subtotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {returnRequest.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="py-4 font-semibold">{item.productName}</td>
                      <td className="py-4 text-slate-500">{item.variantName || '-'}</td>
                      <td className="py-4 text-right">{formatPrice(Number(item.unitPrice || 0))}</td>
                      <td className="py-4 text-center">{item.requestedQuantity}</td>
                      <td className="py-4 text-center">{item.approvedQuantity ?? '-'}</td>
                      <td className="py-4 text-right font-bold text-purple-600">{formatPrice(Number(item.lineAmount || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FiCreditCard className="text-emerald-600" />
              {t('returns.detail.refundTransactionsTitle')}
            </h2>

            {returnRequest.refunds.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-md text-slate-500">
                {t('returns.detail.refundTransactionsEmpty')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[740px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                      <th className="pb-3 font-medium">{t('returns.detail.refundTransactionsTable.time')}</th>
                      <th className="pb-3 font-medium">{t('returns.detail.refundTransactionsTable.provider')}</th>
                      <th className="pb-3 font-medium">{t('returns.detail.refundTransactionsTable.transactionId')}</th>
                      <th className="pb-3 font-medium text-right">{t('returns.detail.refundTransactionsTable.amount')}</th>
                      <th className="pb-3 font-medium text-right">{t('returns.detail.refundTransactionsTable.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnRequest.refunds.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <td className="py-3">{formatDateTime(tx.createdAt)}</td>
                        <td className="py-3">{tx.provider}</td>
                        <td className="py-3">{tx.transactionId || '-'}</td>
                        <td className="py-3 text-right font-semibold">
                          {formatPrice(Number(tx.amount || 0))} {tx.currency}
                        </td>
                        <td className="py-3 text-right"><RefundStatusBadge status={tx.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="w-full xl:w-[380px] 2xl:w-[420px] xl:shrink-0 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiFileText className="text-blue-600" />
              {t('returns.detail.requestInfoTitle')}
            </h2>
            <div className="space-y-3 text-md">
              <div>
                <p className="text-slate-500">{t('returns.detail.customer')}</p>
                <p className="font-semibold">{returnRequest.userName || t('returns.detail.unknown')}</p>
                <p className="text-slate-500">{returnRequest.userEmail || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('returns.detail.reason')}</p>
                <p className="font-medium">{returnRequest.reason}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('returns.detail.customerNote')}</p>
                <p className="font-medium">{returnRequest.evidenceNote || t('returns.detail.none')}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('returns.detail.adminNote')}</p>
                <p className="font-medium">{returnRequest.adminNote || t('returns.detail.noAdminNote')}</p>
              </div>
              {returnRequest.resolvedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <FiClock />
                  {t('returns.detail.resolvedAt', { date: formatDateTime(returnRequest.resolvedAt) })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiDollarSign className="text-purple-600" />
              {t('returns.detail.amountsTitle')}
            </h2>
            <div className="space-y-2 text-md">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returns.detail.requestedAmount')}</span>
                <span className="font-semibold">{formatPrice(Number(returnRequest.requestedAmount || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returns.detail.approvedAmount')}</span>
                <span className="font-semibold">
                  {returnRequest.approvedAmount != null
                    ? formatPrice(Number(returnRequest.approvedAmount || 0))
                    : t('returns.detail.notApprovedYet')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t('returns.detail.refundedAmount')}</span>
                <span className="font-bold text-emerald-600">{formatPrice(Number(returnRequest.refundAmount || 0))}</span>
              </div>
            </div>
          </div>

          {allowReview && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-lg font-bold">{t('returns.detail.reviewTitle')}</h2>
              <input
                type="number"
                min={0}
                step="1000"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder={t('returns.detail.approvedAmountPlaceholder')}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={t('returns.detail.reviewNotePlaceholder')}
                className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="success"
                  icon={<FiCheckCircle />}
                  onClick={() => handleReview(true)}
                  loading={isReviewing}
                  fullWidth
                >
                  {t('returns.detail.approve')}
                </Button>
                <Button
                  variant="danger"
                  icon={<FiXCircle />}
                  onClick={() => handleReview(false)}
                  loading={isReviewing}
                  fullWidth
                >
                  {t('returns.detail.reject')}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
            <h2 className="text-lg font-bold">{t('returns.detail.updateStatusTitle')}</h2>
            <CustomSelect
              value={nextStatus || returnRequest.status}
              onChange={setNextStatus}
              options={statusOptions}
              className="w-full"
              disabled={isUpdatingStatus || statusOptions.length <= 1}
            />
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder={t('returns.detail.statusNotePlaceholder')}
              className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
            <Button
              variant="outline"
              icon={<FiRotateCw />}
              onClick={handleUpdateStatus}
              loading={isUpdatingStatus}
              disabled={statusOptions.length <= 1}
              fullWidth
            >
              {t('returns.detail.saveStatus')}
            </Button>
          </div>

          {allowRefund && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-lg font-bold">{t('returns.detail.refundTitle')}</h2>
              <input
                type="number"
                min={0}
                step="1000"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={t('returns.detail.refundAmountPlaceholder')}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <CustomSelect
                value={refundProvider}
                onChange={setRefundProvider}
                options={[
                  { value: 'MANUAL', label: t('returns.detail.refundProviders.manual') },
                  { value: 'VNPAY', label: t('returns.detail.refundProviders.vnpay') },
                  { value: 'MOMO', label: t('returns.detail.refundProviders.momo') },
                  { value: 'BANK_TRANSFER', label: t('returns.detail.refundProviders.bankTransfer') },
                ]}
                className="w-full"
              />
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={t('returns.detail.transactionIdPlaceholder')}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <textarea
                value={refundAdminNote}
                onChange={(e) => setRefundAdminNote(e.target.value)}
                placeholder={t('returns.detail.refundAdminNotePlaceholder')}
                className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder={t('returns.detail.currencyPlaceholder')}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <textarea
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder={t('returns.detail.rawPayloadPlaceholder')}
                className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
              <Button
                variant="success"
                icon={<FiCreditCard />}
                onClick={handleProcessRefund}
                loading={isRefunding}
                fullWidth
              >
                {t('returns.detail.confirmRefund')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
