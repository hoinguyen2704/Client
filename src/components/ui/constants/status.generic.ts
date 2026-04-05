/**
 * Generic statuses — dùng chung cho nhiều nơi (lowercase).
 */
export const GENERIC_STATUS = {
  completed:   { label: 'Đã giao',     className: 'bg-emerald-100 text-emerald-600' },
  delivered:   { label: 'Đã giao',     className: 'bg-emerald-100 text-emerald-600' },
  processing:  { label: 'Chờ xử lý',   className: 'bg-blue-100 text-blue-600' },
  shipping:    { label: 'Đang giao',    className: 'bg-violet-100 text-violet-600' },
  cancelled:   { label: 'Đã hủy',      className: 'bg-rose-100 text-rose-600' },
  pending:     { label: 'Chờ duyệt',   className: 'bg-amber-100 text-amber-600' },
  verified:    { label: 'Đã xác nhận', className: 'bg-indigo-100 text-indigo-600' },
  active:      { label: 'Hoạt động',   className: 'bg-green-100 text-green-600' },
  inactive:    { label: 'Tạm khóa',    className: 'bg-slate-100 text-slate-600' },
  expired:     { label: 'Hết hạn',     className: 'bg-slate-100 text-slate-500' },
  open:        { label: 'Mới',         className: 'bg-red-100 text-red-600' },
  in_progress: { label: 'Đang xử lý', className: 'bg-orange-100 text-orange-600' },
  replied:     { label: 'Đã trả lời',  className: 'bg-green-100 text-green-600' },
  closed:      { label: 'Đóng',        className: 'bg-slate-100 text-slate-600' },
  vip:         { label: 'VIP',         className: 'bg-purple-100 text-purple-600' },
  banned:      { label: 'Bị khóa',    className: 'bg-red-100 text-red-600' },

  // Backend enums (UPPERCASE)
  ACTIVE:    { label: 'Hoạt động',     className: 'bg-green-100 text-green-600' },
  INACTIVE:  { label: 'Đã ẩn',        className: 'bg-slate-100 text-slate-600' },
  UPCOMING:  { label: 'Sắp diễn ra',  className: 'bg-blue-100 text-blue-600' },
  ENDED:     { label: 'Đã kết thúc',  className: 'bg-slate-100 text-slate-500' },
  EXPIRED:   { label: 'Hết hạn',      className: 'bg-slate-100 text-slate-500' },

  // Ticket statuses (with rich border & dark mode styling)
  OPEN:        { label: 'Đang mở',       className: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  IN_PROGRESS: { label: 'Đang xử lý',   className: 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' },
  ANSWERED:    { label: 'Đã phản hồi',  className: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  RESOLVED:    { label: 'Đã giải quyết', className: 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' },
  CLOSED:      { label: 'Đã đóng',      className: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' },
} as const;
