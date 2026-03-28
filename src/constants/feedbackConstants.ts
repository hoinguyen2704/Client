export const FEEDBACK_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ duyệt', colorClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
  { value: 'APPROVED', label: 'Đã duyệt', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  { value: 'REJECTED', label: 'Từ chối', colorClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' }
];

export const FEEDBACK_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...FEEDBACK_STATUS_OPTIONS
];
