import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import { formatDateFull as formatDateTime, formatPrice } from '@/utils/format';
import returnService from '@/apis/services/returnService';
import type { ReturnRequestResponse } from '@/types';
import { BackButton, Button, ConfirmDialog } from '@/components';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import {
  buildReturnTimelineSteps,
  ReturnStatusBadge,
  RefundStatusBadge,
  canProcessRefund,
  type ReturnStatus,
  getReturnStatusMeta,
} from '@/constants/returnConstants';

export default function ReturnDetail() {
  const { returnNumber } = useParams<{ returnNumber: string }>();
  const [data, setData] = useState<ReturnRequestResponse | null>(null);
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

  const handleCancel = async () => {
    if (!data) return;
    setCancelDialogOpen(false);
    try {
      await returnService.cancel(data.id);
      toast.success('Đã hủy yêu cầu trả hàng');
      fetchDetail();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Hủy yêu cầu trả hàng thất bại'));
    }
  };

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
      <h2 className="text-xl font-bold mb-2">Không tìm thấy yêu cầu trả hàng</h2>
      <Link to="/user/returns" className="text-purple-600 hover:underline">← Quay lại danh sách</Link>
    </div>
  );

  const isCancelled = data.status === 'CANCELLED' || data.status === 'REJECTED';

  // Build vertical timeline entries from buildReturnTimelineSteps
  const { steps: timelineSteps, currentStepIndex } = buildReturnTimelineSteps(
    data.status as ReturnStatus,
    data.createdAt,
    data.resolvedAt,
  );

  // Only show steps up to (and including) the current step
  const visibleSteps = timelineSteps.slice(0, currentStepIndex + 1).reverse(); // newest first

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/user/returns" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Chi tiết {data.returnNumber}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Đơn hàng: <Link to={`/user/orders/${data.orderNumber}`} className="text-purple-600 font-semibold hover:underline">{data.orderNumber}</Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ReturnStatusBadge status={data.status} />
          <RefundStatusBadge status={data.refundStatus} />
          {data.status === 'REQUESTED' && (
            <Button
              variant="danger"
              size="sm"
              icon={<FiXCircle />}
              onClick={() => setCancelDialogOpen(true)}
            >
              Hủy yêu cầu
            </Button>
          )}
        </div>
      </div>

      {/* Cancelled / Rejected Banner */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800 text-red-600 flex items-center gap-3">
          <FiXCircle className="text-2xl flex-shrink-0" />
          <span className="font-bold text-lg">Yêu cầu đã {data.status === 'CANCELLED' ? 'bị hủy' : 'bị từ chối'}</span>
        </div>
      )}

      {/* Vertical Timeline — giống OrderTracking */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
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
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 pt-1">—</div>
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info + Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-4">Thông tin yêu cầu</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lý do</span>
                  <span className="font-medium text-right max-w-[60%]">{data.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ghi chú</span>
                  <span className="font-medium text-right max-w-[60%]">{data.evidenceNote || 'Không có'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tạo lúc</span>
                  <span className="font-medium">{formatDateTime(data.createdAt)}</span>
                </div>
                {data.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kết thúc</span>
                    <span className="font-medium">{formatDateTime(data.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-4">Số tiền</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Yêu cầu hoàn</span>
                  <span className="font-semibold text-purple-600">{formatPrice(Number(data.requestedAmount || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền duyệt</span>
                  <span className="font-semibold">
                    {data.approvedAmount != null ? formatPrice(Number(data.approvedAmount || 0)) : 'Chưa duyệt'}
                  </span>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="flex justify-between text-base">
                  <span className="font-bold">Đã hoàn thực tế</span>
                  <span className="font-bold text-emerald-600">
                    {data.refundAmount != null ? formatPrice(Number(data.refundAmount || 0)) : formatPrice(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Return Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Sản phẩm yêu cầu trả</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.items.map(line => (
                <div key={line.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FiPackage className="text-slate-400 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{line.productName}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{line.variantName || '-'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-sm text-slate-500">{formatPrice(Number(line.unitPrice || 0))} × {line.requestedQuantity}</p>
                    {line.approvedQuantity != null && (
                      <p className="text-xs text-slate-400">Duyệt: {line.approvedQuantity}</p>
                    )}
                    <p className="font-bold text-purple-600">{formatPrice(Number(line.lineAmount || 0))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar: Refund History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Lịch sử hoàn tiền</h3>
              {data.refunds.length > 0 && (
                <span className="text-xs font-semibold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  {data.refunds.length}
                </span>
              )}
            </div>

            {data.refunds.length === 0 ? (
              <div className="p-5 text-sm text-slate-500 flex items-center gap-2">
                {canProcessRefund(data.status) ? (
                  <>
                    <FiAlertTriangle className="text-amber-500 flex-shrink-0" />
                    <span>Đang chờ admin xử lý hoàn tiền.</span>
                  </>
                ) : (
                  <span>Chưa có giao dịch hoàn tiền.</span>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.refunds.map(tx => (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{formatPrice(Number(tx.amount || 0))} {tx.currency}</span>
                      <RefundStatusBadge status={tx.status} />
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>Provider: {tx.provider}</p>
                      {tx.transactionId && <p>Mã GD: {tx.transactionId}</p>}
                      <p>{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Note if rejected */}
          {data.adminNote && (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-100 dark:border-red-800">
              <h3 className="font-bold text-red-600 mb-2">Ghi chú từ admin</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{data.adminNote}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Hủy yêu cầu trả hàng"
        message={`Bạn có chắc muốn hủy ${data.returnNumber}?`}
        confirmLabel="Hủy yêu cầu"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </div>
  );
}
