import type { TFunction } from 'i18next';
import i18n from '@/i18n';

type FeedbackStatusOption = {
  value: 'APPROVED' | 'HIDDEN' | 'SPAM';
  label: string;
  labelKey: string;
  colorClass: string;
};

function translateLabel(t: TFunction | undefined, key: string, fallback: string) {
  const translator = t ?? i18n.t.bind(i18n);
  return translator(key, { defaultValue: fallback });
}

export const FEEDBACK_STATUS_OPTIONS: FeedbackStatusOption[] = [
  { value: 'APPROVED', label: 'Approved', labelKey: 'common:status.cms.approved', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  { value: 'HIDDEN', label: 'Hidden', labelKey: 'common:status.cms.hidden', colorClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
  { value: 'SPAM', label: 'Spam', labelKey: 'common:status.cms.spam', colorClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' },
];

export const MAX_FEEDBACK_IMAGES = 5;
export const FEEDBACK_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/jpg';

export function getFeedbackStatusOptions(t?: TFunction) {
  return FEEDBACK_STATUS_OPTIONS.map((option) => ({
    ...option,
    label: translateLabel(t, option.labelKey, option.label),
  }));
}

export function getFeedbackFilterOptions(t?: TFunction) {
  return [
    { value: '', label: translateLabel(t, 'common:filters.allStatuses', 'All statuses') },
    ...getFeedbackStatusOptions(t),
  ];
}
