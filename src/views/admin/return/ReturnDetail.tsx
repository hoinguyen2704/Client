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
      const meta = getReturnStatusMeta(status);
      return {
        value: status,
        label: meta.label,
        colorClass: meta.className,
      };
    });
  }, [returnRequest]);

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
        description: 'Yêu cầu mới',
        createdAt: returnRequest.createdAt,
      });
    }

    return histories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [returnRequest]);

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
        toast.error('Số tiền duyệt không hợp lệ');
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
      toast.success(approved ? 'Đã duyệt yêu cầu trả hàng' : 'Đã từ chối yêu cầu trả hàng');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Thao tác duyệt trả hàng thất bại'));
    } finally {
      setIsReviewing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!returnRequest) return;
    if (!nextStatus || nextStatus === returnRequest.status) {
      toast.error('Vui lòng chọn trạng thái mới');
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
      toast.success('Đã cập nhật trạng thái yêu cầu');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!returnRequest) return;

    if (!refundAmount.trim()) {
      toast.error('Vui lòng nhập số tiền hoàn');
      return;
    }
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Số tiền hoàn không hợp lệ');
      return;
    }

    const provider = refundProvider.trim().toUpperCase();
    if (!provider) {
      toast.error('Vui lòng chọn provider hoàn tiền');
      return;
    }

    const normalizedTransactionId = transactionId.trim();
    if (!normalizedTransactionId) {
      toast.error('Vui lòng nhập mã giao dịch hoàn tiền');
      return;
    }

    const adminNote = refundAdminNote.trim();
    if (!adminNote) {
      toast.error('Vui lòng nhập ghi chú xử lý hoàn tiền');
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
      toast.success('Đã xử lý hoàn tiền thành công');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xử lý hoàn tiền thất bại'));
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
          Không tìm thấy yêu cầu trả hàng
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
              Đơn hàng: <span className="font-semibold text-slate-700 dark:text-slate-200">{returnRequest.orderNumber}</span> | Tạo lúc{' '}
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
                          {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
              Danh sách sản phẩm trả
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                    <th className="pb-3 font-medium">Sản phẩm</th>
                    <th className="pb-3 font-medium">Phân loại</th>
                    <th className="pb-3 font-medium text-right">Đơn giá</th>
                    <th className="pb-3 font-medium text-center">SL yêu cầu</th>
                    <th className="pb-3 font-medium text-center">SL duyệt</th>
                    <th className="pb-3 font-medium text-right">Thành tiền</th>
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
              Lịch sử giao dịch hoàn tiền
            </h2>

            {returnRequest.refunds.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-md text-slate-500">
                Chưa có giao dịch hoàn tiền nào cho yêu cầu này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[740px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                      <th className="pb-3 font-medium">Thời gian</th>
                      <th className="pb-3 font-medium">Provider</th>
                      <th className="pb-3 font-medium">Mã giao dịch</th>
                      <th className="pb-3 font-medium text-right">Số tiền</th>
                      <th className="pb-3 font-medium text-right">Trạng thái</th>
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
              Thông tin yêu cầu
            </h2>
            <div className="space-y-3 text-md">
              <div>
                <p className="text-slate-500">Khách hàng</p>
                <p className="font-semibold">{returnRequest.userName || 'Không rõ'}</p>
                <p className="text-slate-500">{returnRequest.userEmail || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Lý do</p>
                <p className="font-medium">{returnRequest.reason}</p>
              </div>
              <div>
                <p className="text-slate-500">Ghi chú khách</p>
                <p className="font-medium">{returnRequest.evidenceNote || 'Không có'}</p>
              </div>
              <div>
                <p className="text-slate-500">Ghi chú admin</p>
                <p className="font-medium">{returnRequest.adminNote || 'Chưa có'}</p>
              </div>
              {returnRequest.resolvedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <FiClock />
                  Đã xử lý lúc {formatDateTime(returnRequest.resolvedAt)}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiDollarSign className="text-purple-600" />
              Số tiền
            </h2>
            <div className="space-y-2 text-md">
              <div className="flex justify-between">
                <span className="text-slate-500">Yêu cầu hoàn</span>
                <span className="font-semibold">{formatPrice(Number(returnRequest.requestedAmount || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền duyệt</span>
                <span className="font-semibold">
                  {returnRequest.approvedAmount != null
                    ? formatPrice(Number(returnRequest.approvedAmount || 0))
                    : 'Chưa duyệt'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Đã hoàn thực tế</span>
                <span className="font-bold text-emerald-600">{formatPrice(Number(returnRequest.refundAmount || 0))}</span>
              </div>
            </div>
          </div>

          {allowReview && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-lg font-bold">Duyệt yêu cầu</h2>
              <input
                type="number"
                min={0}
                step="1000"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Số tiền duyệt (để trống = full)"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Ghi chú duyệt/từ chối"
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
                  Duyệt
                </Button>
                <Button
                  variant="danger"
                  icon={<FiXCircle />}
                  onClick={() => handleReview(false)}
                  loading={isReviewing}
                  fullWidth
                >
                  Từ chối
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
            <h2 className="text-lg font-bold">Cập nhật trạng thái</h2>
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
              placeholder="Ghi chú cập nhật trạng thái"
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
              Lưu trạng thái
            </Button>
          </div>

          {allowRefund && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-lg font-bold">Xác nhận hoàn tiền thủ công</h2>
              <input
                type="number"
                min={0}
                step="1000"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Số tiền hoàn (bắt buộc)"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <CustomSelect
                value={refundProvider}
                onChange={setRefundProvider}
                options={[
                  { value: 'MANUAL', label: 'Hoàn tiền thủ công (Cash/Bank)' },
                  { value: 'VNPAY', label: 'Qua VNPAY' },
                  { value: 'MOMO', label: 'Qua MOMO' },
                  { value: 'BANK_TRANSFER', label: 'Chuyển khoản Ngân Hàng' },
                ]}
                className="w-full"
              />
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Mã giao dịch hoàn tiền"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <textarea
                value={refundAdminNote}
                onChange={(e) => setRefundAdminNote(e.target.value)}
                placeholder="Ghi chú admin về giao dịch hoàn tiền (bắt buộc)"
                className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="Đơn vị tiền tệ"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <textarea
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder="Raw payload (optional)"
                className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
              <Button
                variant="success"
                icon={<FiCreditCard />}
                onClick={handleProcessRefund}
                loading={isRefunding}
                fullWidth
              >
                Xác nhận hoàn tiền thủ công
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
