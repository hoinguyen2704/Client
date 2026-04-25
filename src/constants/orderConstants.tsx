import type { TFunction } from 'i18next';
import type { IconType } from 'react-icons';
import { FiCheckCircle, FiPackage, FiTruck, FiXCircle } from 'react-icons/fi';
import i18n from '@/i18n';

export type AdminOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'SHIPPED'
  | 'CANCELLED'
  | 'RETURNED';

type LabelledItem = {
  label: string;
  labelKey: string;
};

type OrderStatusOption = LabelledItem & {
  value: AdminOrderStatus;
  colorClass: string;
};

type ClientOrderTab = LabelledItem & {
  id: 'all' | AdminOrderStatus;
};

type OrderTrackingStep = LabelledItem & {
  key: Exclude<AdminOrderStatus, 'CANCELLED' | 'RETURNED'>;
  icon: IconType;
};

type BadgeConfig = LabelledItem & {
  icon: IconType;
  className: string;
};

function translateLabel(t: TFunction | undefined, key: string, fallback: string) {
  const translator = t ?? i18n.t.bind(i18n);
  return translator(key, { defaultValue: fallback });
}

export const ORDER_STATUS_OPTIONS = [
  {
    value: 'PENDING',
    label: 'Pending processing',
    labelKey: 'adminSales:orders.statusOptions.pending',
    colorClass:
      'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  },
  {
    value: 'CONFIRMED',
    label: 'Confirmed',
    labelKey: 'adminSales:orders.statusOptions.confirmed',
    colorClass:
      'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400',
  },
  {
    value: 'PROCESSING',
    label: 'Processing',
    labelKey: 'adminSales:orders.statusOptions.processing',
    colorClass:
      'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  },
  {
    value: 'SHIPPING',
    label: 'Shipping',
    labelKey: 'adminSales:orders.statusOptions.shipping',
    colorClass:
      'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400',
  },
  {
    value: 'SHIPPED',
    label: 'Delivered',
    labelKey: 'adminSales:orders.statusOptions.shipped',
    colorClass:
      'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    labelKey: 'adminSales:orders.statusOptions.cancelled',
    colorClass:
      'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
  },
  {
    value: 'RETURNED',
    label: 'Returned',
    labelKey: 'adminSales:orders.statusOptions.returned',
    colorClass:
      'bg-slate-50 text-muted border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20',
  },
] satisfies OrderStatusOption[];

export function getOrderFilterOptions(t?: TFunction) {
  return [
    {
      value: '',
      label: translateLabel(t, 'common:filters.allStatuses', 'All statuses'),
    },
    ...ORDER_STATUS_OPTIONS.map((option) => ({
      ...option,
      label: translateLabel(t, option.labelKey, option.label),
    })),
  ];
}

export const ADMIN_ORDER_STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['SHIPPED'],
  SHIPPED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

export const getAdminOrderStatusOptions = (currentStatus: string, t?: TFunction) => {
  const current = currentStatus as AdminOrderStatus;
  const next = ADMIN_ORDER_STATUS_TRANSITIONS[current] || [];
  const allowedStatuses = new Set<AdminOrderStatus>([current, ...next]);

  return ORDER_STATUS_OPTIONS.filter((option) =>
    allowedStatuses.has(option.value as AdminOrderStatus),
  ).map((option) => ({
    ...option,
    label: translateLabel(t, option.labelKey, option.label),
  }));
};

export const CLIENT_ORDER_TABS = [
  { id: 'all', label: 'All', labelKey: 'common:filters.all' },
  { id: 'PENDING', label: 'Awaiting confirmation', labelKey: 'account:orders.tabs.pending' },
  { id: 'CONFIRMED', label: 'Confirmed', labelKey: 'account:orders.tabs.confirmed' },
  { id: 'PROCESSING', label: 'Seller is preparing the package', labelKey: 'account:orders.tabs.processing' },
  { id: 'SHIPPING', label: 'Shipping', labelKey: 'account:orders.tabs.shipping' },
  { id: 'SHIPPED', label: 'Delivered', labelKey: 'account:orders.tabs.shipped' },
  { id: 'CANCELLED', label: 'Cancelled', labelKey: 'account:orders.tabs.cancelled' },
  { id: 'RETURNED', label: 'Returned', labelKey: 'account:orders.tabs.returned' },
] satisfies ClientOrderTab[];

export function getClientOrderTabs(t?: TFunction) {
  return CLIENT_ORDER_TABS.map((tab) => ({
    ...tab,
    label: translateLabel(t, tab.labelKey, tab.label),
  }));
}

export const ORDER_TRACKING_STEPS = [
  { key: 'PENDING', label: 'Awaiting confirmation', labelKey: 'account:orderTracking.steps.pending', icon: FiPackage },
  { key: 'CONFIRMED', label: 'Confirmed', labelKey: 'account:orderTracking.steps.confirmed', icon: FiCheckCircle },
  { key: 'PROCESSING', label: 'Seller is preparing the package', labelKey: 'account:orderTracking.steps.processing', icon: FiPackage },
  { key: 'SHIPPING', label: 'Shipping', labelKey: 'account:orderTracking.steps.shipping', icon: FiTruck },
  { key: 'SHIPPED', label: 'Delivered', labelKey: 'account:orderTracking.steps.shipped', icon: FiCheckCircle },
] satisfies OrderTrackingStep[];

export function getOrderTrackingSteps(t?: TFunction) {
  return ORDER_TRACKING_STEPS.map((step) => ({
    ...step,
    label: translateLabel(t, step.labelKey, step.label),
  }));
}

export const ORDER_STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPING: 3,
  SHIPPED: 4,
};

const CLIENT_STATUS_BADGE_CONFIG: Record<AdminOrderStatus, BadgeConfig> = {
  PENDING: {
    label: 'Awaiting confirmation',
    labelKey: 'account:orders.badges.pending',
    icon: FiPackage,
    className:
      'bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  },
  CONFIRMED: {
    label: 'Confirmed',
    labelKey: 'account:orders.badges.confirmed',
    icon: FiCheckCircle,
    className:
      'bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400',
  },
  PROCESSING: {
    label: 'Seller is preparing the package',
    labelKey: 'account:orders.badges.processing',
    icon: FiPackage,
    className:
      'bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  },
  SHIPPING: {
    label: 'Shipping',
    labelKey: 'account:orders.badges.shipping',
    icon: FiTruck,
    className:
      'bg-violet-50 border border-violet-200 text-violet-600 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400',
  },
  SHIPPED: {
    label: 'Delivered',
    labelKey: 'account:orders.badges.shipped',
    icon: FiCheckCircle,
    className:
      'bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    labelKey: 'account:orders.badges.cancelled',
    icon: FiXCircle,
    className:
      'bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
  },
  RETURNED: {
    label: 'Returned',
    labelKey: 'account:orders.badges.returned',
    icon: FiXCircle,
    className:
      'bg-slate-50 border border-slate-200 text-muted dark:bg-slate-500/10 dark:border-slate-500/20',
  },
};

export const getClientStatusBadge = (status: string, t?: TFunction) => {
  const config = CLIENT_STATUS_BADGE_CONFIG[status as AdminOrderStatus];
  if (!config) {
    return (
      <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-muted text-sm font-bold uppercase tracking-wider">
        {status}
      </span>
    );
  }

  const Icon = config.icon;
  const label = translateLabel(t, config.labelKey, config.label);

  return (
    <span className={`flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${config.className}`}>
      <Icon /> {label}
    </span>
  );
};
