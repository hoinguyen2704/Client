/**
 * Payment statuses — khớp PaymentStatus.java enum.
 */
export const PAYMENT_STATUS = {
  COMPLETED: { label: 'Đã thanh toán', labelKey: 'status.payment.completed', className: 'bg-green-100 text-green-600' },
  FAILED:    { label: 'Thanh toán thất bại', labelKey: 'status.payment.failed', className: 'bg-red-100 text-red-600' },
  REFUNDED:  { label: 'Đã hoàn tiền', labelKey: 'status.payment.refunded', className: 'bg-slate-100 text-slate-600' },
} as const;
