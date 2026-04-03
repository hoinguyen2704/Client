/**
 * Stock / inventory statuses.
 */
export const STOCK_STATUS = {
  low_stock:    { label: 'Sắp hết',  className: 'bg-orange-100 text-orange-600 uppercase tracking-wider' },
  out_of_stock: { label: 'Cạn kho',  className: 'bg-red-100 text-red-600 uppercase tracking-wider' },
} as const;
