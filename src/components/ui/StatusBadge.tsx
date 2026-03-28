import { cn } from '@/utils/cn';
import type { StatusType, StatusBadgeProps } from './types';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  completed:   { label: 'Đã giao',     className: 'bg-emerald-100 text-emerald-600' },
  delivered:   { label: 'Đã giao',     className: 'bg-emerald-100 text-emerald-600' },
  processing:  { label: 'Chờ xử lý',   className: 'bg-blue-100 text-blue-600' },
  shipping:    { label: 'Đang giao',    className: 'bg-violet-100 text-violet-600' },
  cancelled:   { label: 'Đã hủy',      className: 'bg-rose-100 text-rose-600' },
  pending:     { label: 'Chờ duyệt',   className: 'bg-amber-100 text-amber-600' },
  verified:    { label: 'Đã xác nhận', className: 'bg-indigo-100 text-indigo-600' },
  active:      { label: 'Hoạt động',   className: 'bg-green-100 text-green-600' },
  inactive:    { label: 'Tạm khóa',    className: 'bg-slate-100 text-slate-600' },
  expired:     { label: 'Hết hạn',     className: 'bg-slate-100 text-slate-500' },
  open:        { label: 'Mới',         className: 'bg-red-100 text-red-600' },
  in_progress: { label: 'Đang xử lý', className: 'bg-orange-100 text-orange-600' },
  replied:     { label: 'Đã trả lời',  className: 'bg-green-100 text-green-600' },
  closed:      { label: 'Đóng',        className: 'bg-slate-100 text-slate-600' },
  vip:         { label: 'VIP',         className: 'bg-purple-100 text-purple-600' },
  banned:      { label: 'Bị khóa',    className: 'bg-red-100 text-red-600' },
  
  // Order Statuses (Premium Redesign)
  PENDING:   { label: 'Chờ xử lý',   className: 'bg-amber-50 uppercase tracking-wider text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-indigo-50 uppercase tracking-wider text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' },
  PROCESSING:{ label: 'Đang xử lý',  className: 'bg-blue-50 uppercase tracking-wider text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  SHIPPING:  { label: 'Đang giao',   className: 'bg-violet-50 uppercase tracking-wider text-violet-600 border border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400' },
  SHIPPED: { label: 'Đã giao',     className: 'bg-emerald-50 uppercase tracking-wider text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  CANCELLED: { label: 'Đã hủy',      className: 'bg-rose-50 uppercase tracking-wider text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' },
  RETURNED:  { label: 'Đã hoàn',     className: 'bg-slate-50 uppercase tracking-wider text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' }
};

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || { label: status, className: 'bg-slate-100 text-slate-600' };

  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap', config.className, className)}>
      {label || config.label}
    </span>
  );
}

export { statusConfig };
export type { StatusType };
