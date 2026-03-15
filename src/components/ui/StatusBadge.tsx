import { cn } from '@/utils/cn';
import type { StatusType, StatusBadgeProps } from './types';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  completed:   { label: 'Đã giao',     className: 'bg-green-100 text-green-600' },
  delivered:   { label: 'Đã giao',     className: 'bg-green-100 text-green-600' },
  processing:  { label: 'Chờ xử lý',   className: 'bg-orange-100 text-orange-600' },
  shipping:    { label: 'Đang giao',    className: 'bg-blue-100 text-blue-600' },
  cancelled:   { label: 'Đã hủy',      className: 'bg-red-100 text-red-600' },
  pending:     { label: 'Chờ duyệt',   className: 'bg-yellow-100 text-yellow-600' },
  verified:    { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-600' },
  active:      { label: 'Hoạt động',   className: 'bg-green-100 text-green-600' },
  inactive:    { label: 'Tạm khóa',    className: 'bg-slate-100 text-slate-600' },
  expired:     { label: 'Hết hạn',     className: 'bg-slate-100 text-slate-500' },
  open:        { label: 'Mới',         className: 'bg-red-100 text-red-600' },
  in_progress: { label: 'Đang xử lý', className: 'bg-orange-100 text-orange-600' },
  replied:     { label: 'Đã trả lời',  className: 'bg-green-100 text-green-600' },
  closed:      { label: 'Đóng',        className: 'bg-slate-100 text-slate-600' },
  vip:         { label: 'VIP',         className: 'bg-purple-100 text-purple-600' },
  banned:      { label: 'Bị khóa',    className: 'bg-red-100 text-red-600' },
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
