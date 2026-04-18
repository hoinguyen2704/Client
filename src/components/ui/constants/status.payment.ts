/**
 * Payment statuses — khớp PaymentStatus.java enum.
 */
export const PAYMENT_STATUS = {
  COMPLETED: { label: 'Paid', labelKey: 'status.payment.completed', className: 'bg-green-100 text-green-600' },
  FAILED:    { label: 'Payment failed', labelKey: 'status.payment.failed', className: 'bg-red-100 text-red-600' },
  REFUNDED:  { label: 'Refunded', labelKey: 'status.payment.refunded', className: 'bg-slate-100 text-slate-600' },
} as const;
