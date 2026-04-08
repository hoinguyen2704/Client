export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'QC_PASSED'
  | 'QC_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'CLOSED';

export type RefundStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REVERSED';

type StatusMeta = {
  label: string;
  className: string;
};

export const RETURN_STATUS_META: Record<ReturnStatus, StatusMeta> = {
  REQUESTED: {
    label: 'Yêu cầu mới',
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  APPROVED: {
    label: 'Đã duyệt',
    className:
      'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  },
  REJECTED: {
    label: 'Từ chối',
    className:
      'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
  IN_TRANSIT: {
    label: 'Đang gửi trả',
    className:
      'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  },
  RECEIVED: {
    label: 'Đã nhận hàng hoàn',
    className:
      'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
  },
  QC_PASSED: {
    label: 'QC đạt',
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  QC_FAILED: {
    label: 'QC không đạt',
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  },
  REFUND_PENDING: {
    label: 'Chờ hoàn tiền',
    className:
      'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className:
      'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
  },
  CLOSED: {
    label: 'Đã đóng',
    className:
      'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-500/40',
  },
};

export const REFUND_STATUS_META: Record<RefundStatus, StatusMeta> = {
  PENDING: {
    label: 'Chờ hoàn',
    className:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className:
      'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  },
  SUCCESS: {
    label: 'Thành công',
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  FAILED: {
    label: 'Thất bại',
    className:
      'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
  REVERSED: {
    label: 'Đảo ngược',
    className:
      'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
  },
};

const FALLBACK_STATUS_META: StatusMeta = {
  label: 'Không xác định',
  className:
    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
};

export const getReturnStatusMeta = (status: string): StatusMeta => {
  const key = status as ReturnStatus;
  const meta = RETURN_STATUS_META[key];
  if (meta) return meta;
  return { ...FALLBACK_STATUS_META, label: status || FALLBACK_STATUS_META.label };
};

export const getRefundStatusMeta = (status: string): StatusMeta => {
  const key = status as RefundStatus;
  const meta = REFUND_STATUS_META[key];
  if (meta) return meta;
  return { ...FALLBACK_STATUS_META, label: status || FALLBACK_STATUS_META.label };
};

export const ADMIN_RETURN_STATUS_OPTIONS: Array<{ value: ReturnStatus; label: string; colorClass: string }> = [
  { value: 'REQUESTED', label: RETURN_STATUS_META.REQUESTED.label, colorClass: RETURN_STATUS_META.REQUESTED.className },
  { value: 'APPROVED', label: RETURN_STATUS_META.APPROVED.label, colorClass: RETURN_STATUS_META.APPROVED.className },
  { value: 'REJECTED', label: RETURN_STATUS_META.REJECTED.label, colorClass: RETURN_STATUS_META.REJECTED.className },
  { value: 'IN_TRANSIT', label: RETURN_STATUS_META.IN_TRANSIT.label, colorClass: RETURN_STATUS_META.IN_TRANSIT.className },
  { value: 'RECEIVED', label: RETURN_STATUS_META.RECEIVED.label, colorClass: RETURN_STATUS_META.RECEIVED.className },
  { value: 'QC_PASSED', label: RETURN_STATUS_META.QC_PASSED.label, colorClass: RETURN_STATUS_META.QC_PASSED.className },
  { value: 'QC_FAILED', label: RETURN_STATUS_META.QC_FAILED.label, colorClass: RETURN_STATUS_META.QC_FAILED.className },
  { value: 'REFUND_PENDING', label: RETURN_STATUS_META.REFUND_PENDING.label, colorClass: RETURN_STATUS_META.REFUND_PENDING.className },
  { value: 'REFUNDED', label: RETURN_STATUS_META.REFUNDED.label, colorClass: RETURN_STATUS_META.REFUNDED.className },
  { value: 'CANCELLED', label: RETURN_STATUS_META.CANCELLED.label, colorClass: RETURN_STATUS_META.CANCELLED.className },
  { value: 'CLOSED', label: RETURN_STATUS_META.CLOSED.label, colorClass: RETURN_STATUS_META.CLOSED.className },
];

export const RETURN_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...ADMIN_RETURN_STATUS_OPTIONS,
];

export const USER_RETURN_TABS: Array<{ id: 'all' | ReturnStatus; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'REQUESTED', label: 'Yêu cầu mới' },
  { id: 'APPROVED', label: 'Đã duyệt' },
  { id: 'REFUND_PENDING', label: 'Chờ hoàn' },
  { id: 'REFUNDED', label: 'Đã hoàn tiền' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'CANCELLED', label: 'Đã hủy' },
  { id: 'CLOSED', label: 'Đã đóng' },
];

export const RETURN_STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['IN_TRANSIT', 'RECEIVED', 'REJECTED', 'CANCELLED'],
  IN_TRANSIT: ['RECEIVED', 'CANCELLED'],
  RECEIVED: ['QC_PASSED', 'QC_FAILED'],
  QC_PASSED: ['REFUND_PENDING'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  QC_FAILED: ['CLOSED'],
  CANCELLED: [],
  CLOSED: [],
};

export const canProcessRefund = (status: string) =>
  status === 'APPROVED' || status === 'QC_PASSED' || status === 'REFUND_PENDING';

