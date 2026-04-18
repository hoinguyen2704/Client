/**
 * Generic statuses — dùng chung cho nhiều nơi (lowercase).
 */
export const GENERIC_STATUS = {
  completed:   { label: 'Đã giao', labelKey: 'status.generic.completed', className: 'bg-emerald-100 text-emerald-600' },
  delivered:   { label: 'Đã giao', labelKey: 'status.generic.delivered', className: 'bg-emerald-100 text-emerald-600' },
  processing:  { label: 'Chờ xử lý', labelKey: 'status.generic.processing', className: 'bg-blue-100 text-blue-600' },
  shipping:    { label: 'Đang giao', labelKey: 'status.generic.shipping', className: 'bg-violet-100 text-violet-600' },
  cancelled:   { label: 'Đã hủy', labelKey: 'status.generic.cancelled', className: 'bg-rose-100 text-rose-600' },
  pending:     { label: 'Chờ duyệt', labelKey: 'status.generic.pending', className: 'bg-amber-100 text-amber-600' },
  verified:    { label: 'Đã xác nhận', labelKey: 'status.generic.verified', className: 'bg-indigo-100 text-indigo-600' },
  active:      { label: 'Hoạt động', labelKey: 'status.generic.active', className: 'bg-green-100 text-green-600' },
  inactive:    { label: 'Tạm khóa', labelKey: 'status.generic.inactive', className: 'bg-slate-100 text-slate-600' },
  expired:     { label: 'Hết hạn', labelKey: 'status.generic.expired', className: 'bg-slate-100 text-slate-500' },
  open:        { label: 'Mới', labelKey: 'status.generic.open', className: 'bg-red-100 text-red-600' },
  in_progress: { label: 'Đang xử lý', labelKey: 'status.generic.inProgress', className: 'bg-orange-100 text-orange-600' },
  replied:     { label: 'Đã trả lời', labelKey: 'status.generic.replied', className: 'bg-green-100 text-green-600' },
  closed:      { label: 'Đóng', labelKey: 'status.generic.closed', className: 'bg-slate-100 text-slate-600' },
  vip:         { label: 'VIP', labelKey: 'status.generic.vip', className: 'bg-purple-100 text-purple-600' },
  banned:      { label: 'Bị khóa', labelKey: 'status.generic.banned', className: 'bg-red-100 text-red-600' },

  // Backend enums (UPPERCASE)
  ACTIVE:    { label: 'Hoạt động', labelKey: 'status.generic.active', className: 'bg-green-100 text-green-600' },
  DRAFT:     { label: 'Bản nháp', labelKey: 'status.cms.draft', className: 'bg-orange-100 text-orange-600' },
  INACTIVE:  { label: 'Đã ẩn', labelKey: 'status.cms.hidden', className: 'bg-slate-100 text-slate-600' },
  UPCOMING:  { label: 'Sắp diễn ra', labelKey: 'status.cms.upcoming', className: 'bg-blue-100 text-blue-600' },
  ENDED:     { label: 'Đã kết thúc', labelKey: 'status.cms.ended', className: 'bg-slate-100 text-slate-500' },
  EXPIRED:   { label: 'Hết hạn', labelKey: 'status.generic.expired', className: 'bg-slate-100 text-slate-500' },

  // Ticket statuses (with rich border & dark mode styling)
  OPEN:        { label: 'Đang mở', labelKey: 'status.ticket.open', className: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  IN_PROGRESS: { label: 'Đang xử lý', labelKey: 'status.ticket.inProgress', className: 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' },
  ANSWERED:    { label: 'Đã phản hồi', labelKey: 'status.ticket.answered', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  RESOLVED:    { label: 'Đã giải quyết', labelKey: 'status.ticket.resolved', className: 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' },
  CLOSED:      { label: 'Đã đóng', labelKey: 'status.ticket.closed', className: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' },
} as const;
