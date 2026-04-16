export function getInventoryBadgeClass(stock: number) {
  if (stock <= 0) {
    return "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
  }

  if (stock < 10) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
}
