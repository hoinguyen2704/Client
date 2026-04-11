import { cn } from '@/utils/cn';
import type { StatusType, StatusBadgeProps } from './types';
import { STATUS_CONFIG } from './constants';

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusType] || { label: status, className: 'bg-slate-100 text-slate-600' };

  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap', config.className, className)}>
      {label || config.label}
    </span>
  );
}
