import type { TFunction } from 'i18next';
import { STATUS_CONFIG } from '@/components/ui/constants';
import type { StatusType } from '@/components/ui/types';
import i18n from '@/i18n';

export const TICKET_STATUS_KEYS: StatusType[] = [
  'OPEN',
  'IN_PROGRESS',
  'ANSWERED',
  'RESOLVED',
  'CLOSED'
];

function translateLabel(t: TFunction | undefined, key: string, fallback: string) {
  const translator = t ?? i18n.t.bind(i18n);
  return translator(key, { defaultValue: fallback });
}

export function getTicketStatusOptions(t?: TFunction) {
  return TICKET_STATUS_KEYS.map((key) => {
    const config = STATUS_CONFIG[key];
    const label = config?.labelKey
      ? translateLabel(t, `common:${config.labelKey}`, config.label)
      : (config?.label || key);

    return {
      value: key,
      label,
      colorClass: config?.className,
    };
  });
}

export function getTicketFilterOptions(t?: TFunction) {
  return [
    { value: '', label: translateLabel(t, 'common:filters.allStatuses', 'All statuses') },
    ...getTicketStatusOptions(t),
  ];
}
