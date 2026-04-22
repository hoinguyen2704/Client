/**
 * Stock / inventory statuses.
 */
export const STOCK_STATUS = {
  low_stock:    { label: 'Low stock', labelKey: 'status.stock.lowStock', className: 'bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-wider dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  out_of_stock: { label: 'Out of stock', labelKey: 'status.stock.outOfStock', className: 'bg-red-50 text-red-700 border-red-200 uppercase tracking-wider dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' },
} as const;
