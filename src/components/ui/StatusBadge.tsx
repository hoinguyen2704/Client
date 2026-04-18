import { cn } from '@/utils/cn';
import type { StatusType, StatusBadgeProps } from './types';
import { STATUS_CONFIG } from './constants';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { t } = useTranslation('common');
  const config = STATUS_CONFIG[status as StatusType] || { label: status, className: 'bg-slate-100 text-slate-600' };
  const resolvedLabel = label || (config.labelKey ? t(config.labelKey, { defaultValue: config.label }) : config.label);

  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap', config.className, className)}>
      {resolvedLabel}
    </span>
  );
}
