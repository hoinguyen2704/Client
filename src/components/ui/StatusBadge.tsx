import { cn } from '@/utils/cn';
import type { StatusType, StatusBadgeProps } from './types';
import { STATUS_CONFIG } from './constants';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { t } = useTranslation('common');
  const config = STATUS_CONFIG[status as StatusType] || { label: status, className: 'bg-slate-100 text-muted' };
  const resolvedLabel = label || (config.labelKey ? t(config.labelKey, { defaultValue: config.label }) : config.label);

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold whitespace-nowrap border', config.className, className)}>
      {resolvedLabel}
    </span>
  );
}
