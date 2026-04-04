export const TICKET_STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Đang mở', colorClass: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý', colorClass: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' },
  { value: 'ANSWERED', label: 'Đã phản hồi', colorClass: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400' },
  { value: 'RESOLVED', label: 'Đã giải quyết', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  { value: 'CLOSED', label: 'Đã đóng', colorClass: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' }
];

export const TICKET_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...TICKET_STATUS_OPTIONS
];
