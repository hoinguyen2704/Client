/**
 * Stock / inventory statuses.
 */
export const STOCK_STATUS = {
  low_stock:    { label: 'Low stock', labelKey: 'status.stock.lowStock', className: 'bg-orange-100 text-orange-600 uppercase tracking-wider' },
  out_of_stock: { label: 'Out of stock', labelKey: 'status.stock.outOfStock', className: 'bg-red-100 text-red-600 uppercase tracking-wider' },
} as const;
