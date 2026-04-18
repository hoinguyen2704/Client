import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { formatDateFull as formatDateTime, formatPrice } from '@/utils/format';
import orderService from '@/apis/services/orderService';
import returnService from '@/apis/services/returnService';
import type { OrderResponse, ReturnRequestResponse } from '@/types';
import { BackButton, Button, ConfirmDialog } from '@/components';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { useTranslation } from 'react-i18next';
import {
  buildReturnTimelineSteps,
  ReturnStatusBadge,
  RefundStatusBadge,
  canProcessRefund,
  type ReturnStatus,
} from '@/constants/returnConstants';

export default function ReturnDetail() {
  const { t } = useTranslation('account');
  const { returnNumber } = useParams<{ returnNumber: string }>();
  const [data, setData] = useState<ReturnRequestResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const fetchDetail = async () => {
    if (!returnNumber) return;
    setLoading(true);
    try {
      const res = await returnService.getByNumber(returnNumber);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [returnNumber]);

  useEffect(() => {
    setOrder(null);

    if (!data?.orderNumber) return;

    let cancelled = false;

    orderService
      .getByNumber(data.orderNumber)
      .then((res) => {
        if (!cancelled) {
          setOrder(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrder(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data?.orderNumber]);

  const handleCancel = async () => {
    if (!data) return;
    setCancelDialogOpen(false);
    try {
      await returnService.cancel(data.id);
      toast.success(t('returnDetail.toasts.cancelSuccess'));
      fetchDetail();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t, 'returnDetail.toasts.cancelFailed'));
    }
  };

  const isCancelled = data?.status === 'CANCELLED' || data?.status === 'REJECTED';

  // Build vertical timeline entries from buildReturnTimelineSteps
  const { steps: timelineSteps, currentStepIndex } = buildReturnTimelineSteps(
    ((data?.status as ReturnStatus) || 'REQUESTED'),
    data?.createdAt,
    data?.resolvedAt,
  );

  const statusTimestamps = useMemo(() => {
    const map: Record<string, string> = {};
    if (!data) return map;

    const histories = data.statusHistories ? [...data.statusHistories] : [];

    histories.forEach((history) => {
      if (!history.status || !history.createdAt) return;
      const existing = map[history.status];
      if (!existing || new Date(history.createdAt).getTime() > new Date(existing).getTime()) {
        map[history.status] = history.createdAt;
      }
    });

    if (!map.REQUESTED) {
      map.REQUESTED = data.createdAt;
    }

    return map;
  }, [data]);

  const orderItemImageMap = useMemo(() => {
    const map: Record<string, string> = {};

    order?.items.forEach((item) => {
      if (item.id && item.imageUrl) {
        map[item.id] = item.imageUrl;
      }
    });

    return map;
  }, [order]);

  // Only show steps up to (and including) the current step
  const visibleSteps = useMemo(() => {
    if (!data) return [];

    return timelineSteps
      .slice(0, currentStepIndex + 1)
      .map((step) => ({
        ...step,
        timestamp:
          statusTimestamps[step.key] ||
          (step.key === data.status ? data.resolvedAt || undefined : undefined) ||
          (step.key === 'REQUESTED' ? data.createdAt : undefined),
      }))
      .reverse(); // newest first
  }, [data, timelineSteps, currentStepIndex, statusTimestamps]);

  /* ---------- Loading ---------- */
  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 animate-pulse">
        <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />)}</div>
      </div>
    </div>
  );

  /* ---------- Not Found ---------- */
  if (!data) return (
    <div className="text-center py-12">
      <FiXCircle className="text-6xl text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">{t('returnDetail.notFound.title')}</h2>
      <Link to="/user/returns" className="text-purple-600 hover:underline">← {t('returnDetail.notFound.back')}</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/user/returns" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{t('returnDetail.header.title', { returnNumber: data.returnNumber })}</h1>
            <p className="text-md text-slate-500 mt-0.5">
              {t('returnDetail.header.order')}: <Link to={`/user/orders/${data.orderNumber}`} className="text-purple-600 font-semibold hover:underline">{data.orderNumber}</Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ReturnStatusBadge status={data.status} />
          <RefundStatusBadge status={data.refundStatus} />
          {data.status === 'REQUESTED' && (
            <Button
              variant="danger"
              size="md"
              icon={<FiXCircle />}
              onClick={() => setCancelDialogOpen(true)}
            >
              {t('returnDetail.actions.cancel')}
            </Button>
          )}
        </div>
      </div>

      {/* Cancelled / Rejected Banner */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800 text-red-600 flex items-center gap-3">
          <FiXCircle className="text-2xl flex-shrink-0" />
          <span className="font-bold text-lg">{data.status === 'CANCELLED' ? t('returnDetail.cancelledBanner.cancelled') : t('returnDetail.cancelledBanner.rejected')}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Timeline, Products, Admin Note */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Vertical Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
            <div className="relative">
              {visibleSteps.map((step, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === visibleSteps.length - 1;
                const time = step.timestamp ? new Date(step.timestamp) : null;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Left: Time */}
                    <div className="w-20 flex-shrink-0 text-right pt-1">
                      {time ? (
                        <>
                          <div className="text-md font-medium text-slate-800 dark:text-slate-200">
                            {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-md text-slate-500 mt-1">
                            {time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                        </>
                      ) : (
                        <div className="text-md text-slate-400 pt-1">—</div>
                      )}
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
                        {step.label}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Return Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{t('returnDetail.itemsTitle')}</h3>
            <div className="space-y-3">
              {data.items.map(line => {
                const imageUrl = line.imageUrl || (line.orderItemId ? orderItemImageMap[line.orderItemId] : undefined);

                return (
                  <div key={line.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={line.productName} className="w-full h-full object-cover" />
                      ) : (
                        <FiPackage className="text-slate-400 text-3xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate" title={line.productName}>
                        {line.productName}
                      </h4>
                      <p className="text-md text-slate-500 mt-0.5">
                        {line.variantName ? `${line.variantName} | ` : ''} 
                        {formatPrice(Number(line.unitPrice || 0))} x {line.requestedQuantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <p className="font-bold text-purple-600 text-lg">{formatPrice(Number(line.lineAmount || 0))}</p>
                      {line.approvedQuantity != null && (
                        <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full inline-block">
                          {t('returnDetail.approvedQuantity', { count: line.approvedQuantity })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Note if rejected */}
          {data.adminNote && (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-100 dark:border-red-800">
              <h3 className="font-bold text-red-600 mb-2">{t('returnDetail.adminNoteTitle')}</h3>
              <p className="text-md text-red-700 dark:text-red-300">{data.adminNote}</p>
            </div>
          )}
        </div>

        {/* Right Column: Request Info, Amount, Refund History */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
          {/* Request Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-md border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4">{t('returnDetail.info.title')}</h3>
            <div className="space-y-3 text-md">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returnDetail.info.reason')}</span>
                <span className="font-medium text-right max-w-[60%]">{data.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returnDetail.info.note')}</span>
                <span className="font-medium text-right max-w-[60%]">{data.evidenceNote || t('returnDetail.info.none')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returnDetail.info.createdAt')}</span>
                <span className="font-medium">{formatDateTime(data.createdAt)}</span>
              </div>
              {data.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('returnDetail.info.resolvedAt')}</span>
                  <span className="font-medium">{formatDateTime(data.resolvedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-md border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4">{t('returnDetail.amount.title')}</h3>
            <div className="space-y-3 text-md">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returnDetail.amount.requested')}</span>
                <span className="font-semibold text-purple-600">{formatPrice(Number(data.requestedAmount || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('returnDetail.amount.approved')}</span>
                <span className="font-semibold">
                  {data.approvedAmount != null ? formatPrice(Number(data.approvedAmount || 0)) : t('returnDetail.amount.pending')}
                </span>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between text-base">
                <span className="font-bold">{t('returnDetail.amount.actualRefunded')}</span>
                <span className="font-bold text-emerald-600">
                  {data.refundAmount != null ? formatPrice(Number(data.refundAmount || 0)) : formatPrice(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Refund History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">{t('returnDetail.refunds.title')}</h3>
              {data.refunds.length > 0 && (
                <span className="text-md font-semibold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  {data.refunds.length}
                </span>
              )}
            </div>

            {data.refunds.length === 0 ? (
              <div className="p-5 text-md text-slate-500 flex items-center gap-2">
                {canProcessRefund(data.status) ? (
                  <>
                    <FiAlertTriangle className="text-amber-500 flex-shrink-0" />
                    <span>{t('returnDetail.refunds.pending')}</span>
                  </>
                ) : (
                  <span>{t('returnDetail.refunds.empty')}</span>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.refunds.map(tx => (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-md font-semibold">{formatPrice(Number(tx.amount || 0))} {tx.currency}</span>
                      <RefundStatusBadge status={tx.status} />
                    </div>
                    <div className="text-md text-slate-500 space-y-0.5">
                      <p>{t('returnDetail.refunds.provider')}: {tx.provider}</p>
                      {tx.transactionId && <p>{t('returnDetail.refunds.transactionId')}: {tx.transactionId}</p>}
                      <p>{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        title={t('returnDetail.cancelDialog.title')}
        message={t('returnDetail.cancelDialog.message', { returnNumber: data.returnNumber })}
        confirmLabel={t('returnDetail.cancelDialog.confirm')}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </div>
  );
}
