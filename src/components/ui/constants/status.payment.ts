/**
 * Payment statuses — khớp PaymentStatus.java enum.
 */
export const PAYMENT_STATUS = {
  COMPLETED: { label: 'Paid', labelKey: 'status.payment.completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  FAILED:    { label: 'Payment failed', labelKey: 'status.payment.failed', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' },
  REFUNDED:  { label: 'Refunded', labelKey: 'status.payment.refunded', className: 'bg-slate-100 text-body border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
} as const;
