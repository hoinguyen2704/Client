/**
 * Order statuses — khớp OrderStatus.java enum.
 */
export const ORDER_STATUS = {
  PENDING:    { label: 'Chờ xử lý',   className: 'bg-amber-50 uppercase tracking-wider text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
  CONFIRMED:  { label: 'Đã xác nhận', className: 'bg-indigo-50 uppercase tracking-wider text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' },
  PROCESSING: { label: 'Đang xử lý',  className: 'bg-blue-50 uppercase tracking-wider text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  SHIPPING:   { label: 'Đang giao',   className: 'bg-violet-50 uppercase tracking-wider text-violet-600 border border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400' },
  SHIPPED:    { label: 'Đã giao',     className: 'bg-emerald-50 uppercase tracking-wider text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  CANCELLED:  { label: 'Đã hủy',      className: 'bg-rose-50 uppercase tracking-wider text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' },
  RETURNED:   { label: 'Đã hoàn',     className: 'bg-slate-50 uppercase tracking-wider text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' },
} as const;
