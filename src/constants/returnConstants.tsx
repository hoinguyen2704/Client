import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { TimelineStep } from '@/components/ui/types';
import i18n from '@/i18n';
import { formatDateFull } from '@/utils/format';

export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'QC_PASSED'
  | 'QC_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'CLOSED';

export type RefundStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REVERSED';

type StatusMeta = {
  label: string;
  labelKey: string;
  className: string;
};

type ReturnStatusOption = {
  value: ReturnStatus;
  label: string;
  labelKey: string;
  colorClass: string;
};

type ReturnTab = {
  id: 'all' | ReturnStatus;
  label: string;
  labelKey: string;
};

function translateLabel(t: TFunction | undefined, key: string, fallback: string) {
  const translator = t ?? i18n.t.bind(i18n);
  return translator(key, { defaultValue: fallback });
}

export const RETURN_STATUS_META: Record<ReturnStatus, StatusMeta> = {
  REQUESTED: {
    label: 'New request',
    labelKey: 'common:status.return.requested',
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  APPROVED: {
    label: 'Approved',
    labelKey: 'common:status.return.approved',
    className:
      'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  },
  REJECTED: {
    label: 'Rejected',
    labelKey: 'common:status.return.rejected',
    className:
      'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
  IN_TRANSIT: {
    label: 'In transit',
    labelKey: 'common:status.return.inTransit',
    className:
      'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  },
  RECEIVED: {
    label: 'Returned items received',
    labelKey: 'common:status.return.received',
    className:
      'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
  },
  QC_PASSED: {
    label: 'QC passed',
    labelKey: 'common:status.return.qcPassed',
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  QC_FAILED: {
    label: 'QC failed',
    labelKey: 'common:status.return.qcFailed',
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  },
  REFUND_PENDING: {
    label: 'Refund pending',
    labelKey: 'common:status.return.refundPending',
    className:
      'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
  },
  REFUNDED: {
    label: 'Refunded',
    labelKey: 'common:status.return.refunded',
    className:
      'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    labelKey: 'common:status.return.cancelled',
    className:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
  },
  CLOSED: {
    label: 'Closed',
    labelKey: 'common:status.return.closed',
    className:
      'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-500/40',
  },
};

export const REFUND_STATUS_META: Record<RefundStatus, StatusMeta> = {
  PENDING: {
    label: 'Refund pending',
    labelKey: 'common:status.refund.pending',
    className:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
  },
  PROCESSING: {
    label: 'Processing',
    labelKey: 'common:status.refund.processing',
    className:
      'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  },
  SUCCESS: {
    label: 'Success',
    labelKey: 'common:status.refund.success',
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  FAILED: {
    label: 'Failed',
    labelKey: 'common:status.refund.failed',
    className:
      'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
  REVERSED: {
    label: 'Reversed',
    labelKey: 'common:status.refund.reversed',
    className:
      'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
  },
};

const FALLBACK_STATUS_META: StatusMeta = {
  label: 'Unknown',
  labelKey: 'common:status.return.unknown',
  className:
    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30',
};

export const getReturnStatusMeta = (status: string, t?: TFunction): StatusMeta => {
  const key = status as ReturnStatus;
  const meta = RETURN_STATUS_META[key];

  if (meta) {
    return {
      ...meta,
      label: translateLabel(t, meta.labelKey, meta.label),
    };
  }

  return {
    ...FALLBACK_STATUS_META,
    label: status || translateLabel(t, FALLBACK_STATUS_META.labelKey, FALLBACK_STATUS_META.label),
  };
};

export const getRefundStatusMeta = (status: string, t?: TFunction): StatusMeta => {
  const key = status as RefundStatus;
  const meta = REFUND_STATUS_META[key];

  if (meta) {
    return {
      ...meta,
      label: translateLabel(t, meta.labelKey, meta.label),
    };
  }

  return {
    ...FALLBACK_STATUS_META,
    label: status || translateLabel(t, FALLBACK_STATUS_META.labelKey, FALLBACK_STATUS_META.label),
  };
};

export const ADMIN_RETURN_STATUS_OPTIONS: ReturnStatusOption[] = [
  { value: 'REQUESTED', label: RETURN_STATUS_META.REQUESTED.label, labelKey: RETURN_STATUS_META.REQUESTED.labelKey, colorClass: RETURN_STATUS_META.REQUESTED.className },
  { value: 'APPROVED', label: RETURN_STATUS_META.APPROVED.label, labelKey: RETURN_STATUS_META.APPROVED.labelKey, colorClass: RETURN_STATUS_META.APPROVED.className },
  { value: 'REJECTED', label: RETURN_STATUS_META.REJECTED.label, labelKey: RETURN_STATUS_META.REJECTED.labelKey, colorClass: RETURN_STATUS_META.REJECTED.className },
  { value: 'IN_TRANSIT', label: RETURN_STATUS_META.IN_TRANSIT.label, labelKey: RETURN_STATUS_META.IN_TRANSIT.labelKey, colorClass: RETURN_STATUS_META.IN_TRANSIT.className },
  { value: 'RECEIVED', label: RETURN_STATUS_META.RECEIVED.label, labelKey: RETURN_STATUS_META.RECEIVED.labelKey, colorClass: RETURN_STATUS_META.RECEIVED.className },
  { value: 'QC_PASSED', label: RETURN_STATUS_META.QC_PASSED.label, labelKey: RETURN_STATUS_META.QC_PASSED.labelKey, colorClass: RETURN_STATUS_META.QC_PASSED.className },
  { value: 'QC_FAILED', label: RETURN_STATUS_META.QC_FAILED.label, labelKey: RETURN_STATUS_META.QC_FAILED.labelKey, colorClass: RETURN_STATUS_META.QC_FAILED.className },
  { value: 'REFUND_PENDING', label: RETURN_STATUS_META.REFUND_PENDING.label, labelKey: RETURN_STATUS_META.REFUND_PENDING.labelKey, colorClass: RETURN_STATUS_META.REFUND_PENDING.className },
  { value: 'REFUNDED', label: RETURN_STATUS_META.REFUNDED.label, labelKey: RETURN_STATUS_META.REFUNDED.labelKey, colorClass: RETURN_STATUS_META.REFUNDED.className },
  { value: 'CANCELLED', label: RETURN_STATUS_META.CANCELLED.label, labelKey: RETURN_STATUS_META.CANCELLED.labelKey, colorClass: RETURN_STATUS_META.CANCELLED.className },
  { value: 'CLOSED', label: RETURN_STATUS_META.CLOSED.label, labelKey: RETURN_STATUS_META.CLOSED.labelKey, colorClass: RETURN_STATUS_META.CLOSED.className },
];

export function getReturnFilterOptions(t?: TFunction) {
  return [
    {
      value: '',
      label: translateLabel(t, 'common:filters.allStatuses', 'All statuses'),
    },
    ...ADMIN_RETURN_STATUS_OPTIONS.map((option) => ({
      ...option,
      label: translateLabel(t, option.labelKey, option.label),
    })),
  ];
}

export const USER_RETURN_TABS: ReturnTab[] = [
  { id: 'all', label: 'All', labelKey: 'common:filters.all' },
  { id: 'REQUESTED', label: 'New request', labelKey: RETURN_STATUS_META.REQUESTED.labelKey },
  { id: 'APPROVED', label: 'Approved', labelKey: RETURN_STATUS_META.APPROVED.labelKey },
  { id: 'REFUND_PENDING', label: 'Refund pending', labelKey: REFUND_STATUS_META.PENDING.labelKey },
  { id: 'REFUNDED', label: 'Refunded', labelKey: RETURN_STATUS_META.REFUNDED.labelKey },
  { id: 'REJECTED', label: 'Rejected', labelKey: RETURN_STATUS_META.REJECTED.labelKey },
  { id: 'CANCELLED', label: 'Cancelled', labelKey: RETURN_STATUS_META.CANCELLED.labelKey },
  { id: 'CLOSED', label: 'Closed', labelKey: RETURN_STATUS_META.CLOSED.labelKey },
];

export function getUserReturnTabs(t?: TFunction) {
  return USER_RETURN_TABS.map((tab) => ({
    ...tab,
    label: translateLabel(t, tab.labelKey, tab.label),
  }));
}

export const RETURN_STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['IN_TRANSIT', 'RECEIVED', 'REJECTED', 'CANCELLED'],
  IN_TRANSIT: ['RECEIVED', 'CANCELLED'],
  RECEIVED: ['QC_PASSED', 'QC_FAILED'],
  QC_PASSED: ['REFUND_PENDING'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  QC_FAILED: ['CLOSED'],
  CANCELLED: [],
  CLOSED: [],
};

export const canProcessRefund = (status: string) =>
  status === 'QC_PASSED' || status === 'REFUND_PENDING';

export function buildReturnTimelineSteps(
  status: ReturnStatus,
  createdAt?: string,
  resolvedAt?: string,
  t?: TFunction,
): { steps: TimelineStep[]; currentStepIndex: number } {
  let baseFlow: ReturnStatus[] = [
    'REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED',
    'QC_PASSED', 'REFUND_PENDING', 'REFUNDED', 'CLOSED',
  ];

  if (status === 'REJECTED') {
    baseFlow = ['REQUESTED', 'REJECTED', 'CLOSED'];
  } else if (status === 'CANCELLED') {
    baseFlow = ['REQUESTED', 'CANCELLED'];
  } else if (status === 'QC_FAILED') {
    baseFlow = ['REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'QC_FAILED', 'CLOSED'];
  }

  const currentStepIndex = baseFlow.indexOf(status);
  const steps: TimelineStep[] = baseFlow.map((stepStatus) => {
    const meta = getReturnStatusMeta(stepStatus, t);
    let color = 'from-purple-500 to-purple-600';
    if (stepStatus === 'REJECTED' || stepStatus === 'CANCELLED' || stepStatus === 'QC_FAILED') {
      color = 'from-red-500 to-red-600';
    } else if (stepStatus === 'REFUNDED' || stepStatus === 'CLOSED') {
      color = 'from-emerald-500 to-emerald-600';
    } else if (stepStatus === 'QC_PASSED' || stepStatus === 'APPROVED') {
      color = 'from-blue-500 to-blue-600';
    }

    return {
      key: stepStatus,
      label: meta.label,
      colorClass: color,
    };
  });

  if (createdAt && steps[0]) {
    steps[0].timestamp = formatDateFull(createdAt);
  }

  if (resolvedAt && currentStepIndex >= 0 && steps[currentStepIndex]) {
    steps[currentStepIndex].timestamp = formatDateFull(resolvedAt);
  }

  return {
    steps,
    currentStepIndex: currentStepIndex !== -1 ? currentStepIndex : 0,
  };
}

export function ReturnStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation('common');
  const meta = getReturnStatusMeta(status, t);

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-md font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function RefundStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation('common');
  const meta = getRefundStatusMeta(status, t);

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-md font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
