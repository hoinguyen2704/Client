/**
 * Order statuses — khớp OrderStatus.java enum.
 */
export const ORDER_STATUS = {
  PENDING:    { label: 'Pending processing', labelKey: 'status.order.pending', className: 'bg-amber-50 uppercase tracking-wider text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' },
  CONFIRMED:  { label: 'Confirmed', labelKey: 'status.order.confirmed', className: 'bg-sky-50 uppercase tracking-wider text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300' },
  PROCESSING: { label: 'Processing', labelKey: 'status.order.processing', className: 'bg-blue-50 uppercase tracking-wider text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300' },
  SHIPPING:   { label: 'Shipping', labelKey: 'status.order.shipping', className: 'bg-cyan-50 uppercase tracking-wider text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-300' },
  SHIPPED:    { label: 'Delivered', labelKey: 'status.order.shipped', className: 'bg-emerald-50 uppercase tracking-wider text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' },
  CANCELLED:  { label: 'Cancelled', labelKey: 'status.order.cancelled', className: 'bg-rose-50 uppercase tracking-wider text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300' },
  RETURNED:   { label: 'Returned', labelKey: 'status.order.returned', className: 'bg-slate-100 uppercase tracking-wider text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-300' },
} as const;
