import { STATUS_CONFIG } from '@/components/ui/constants';
import type { StatusType } from '@/components/ui/types';

export const TICKET_STATUS_KEYS: StatusType[] = [
  'OPEN',
  'IN_PROGRESS',
  'ANSWERED',
  'RESOLVED',
  'CLOSED'
];

export const TICKET_STATUS_OPTIONS = TICKET_STATUS_KEYS.map((key) => ({
  value: key,
  label: STATUS_CONFIG[key]?.label || key,
  colorClass: STATUS_CONFIG[key]?.className,
}));

export const TICKET_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...TICKET_STATUS_OPTIONS,
];
