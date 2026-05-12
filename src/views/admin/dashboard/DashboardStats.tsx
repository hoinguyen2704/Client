import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiRefreshCcw, FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import type { DashboardStatsProps } from './types';

const FULL_GROUP_LIMIT = 3; // đơn vị, nghìn, triệu
const COMPACT_GROUP_LIMIT = 3;
const GROUP_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'P'] as const;

function formatDashboardMetric(value: number = 0) {
  if (!Number.isFinite(value)) return '0';

  const sign = value < 0 ? '-' : '';
  const integerValue = Math.trunc(Math.abs(value));
  const fullValue = integerValue.toLocaleString('vi-VN');
  const groups = fullValue.split('.');

  if (groups.length <= FULL_GROUP_LIMIT) {
    return `${sign}${fullValue}`;
  }

  const omittedGroups = groups.length - COMPACT_GROUP_LIMIT;
  const suffix = GROUP_SUFFIXES[omittedGroups] ?? `e${omittedGroups * 3}`;
  return `${sign}${groups.slice(0, COMPACT_GROUP_LIMIT).join('.')}${suffix}`;
}

export default function DashboardStats({ stats, onOpenModal }: DashboardStatsProps) {
  const { t } = useTranslation('adminDashboard');
  const fmt = (n: number = 0) => formatDashboardMetric(n);
  const compactPrice = (n: number = 0) => `${formatDashboardMetric(n)} đ`;

  const cards = [
    { key: 'revenue', label: t('stats.revenue'), value: compactPrice(stats.totalRevenue ?? 0), title: formatPrice(stats.totalRevenue ?? 0), icon: FiDollarSign, color: 'blue' },
    { key: 'orders', label: t('stats.orders.label'), value: fmt(stats.totalOrders ?? 0), title: (stats.totalOrders ?? 0).toLocaleString('vi-VN'), sub: t('stats.orders.sub', { count: fmt(stats.newOrders ?? 0) }), icon: FiShoppingBag, color: 'blue' },
    { key: 'customers', label: t('stats.customers.label'), value: fmt(stats.totalCustomers ?? 0), title: (stats.totalCustomers ?? 0).toLocaleString('vi-VN'), sub: t('stats.customers.sub', { count: fmt(stats.newCustomers ?? 0) }), icon: FiUsers, color: 'orange' },
    { key: 'products', label: t('stats.productsSold'), value: fmt(stats.productsSold ?? 0), title: (stats.productsSold ?? 0).toLocaleString('vi-VN'), icon: FiBox, color: 'emerald' },
    { key: 'returns', label: t('stats.returns.label'), value: fmt((stats.cancelledOrders ?? 0) + (stats.returnedOrders ?? 0)), title: ((stats.cancelledOrders ?? 0) + (stats.returnedOrders ?? 0)).toLocaleString('vi-VN'), sub: t('stats.returns.sub', { cancelled: fmt(stats.cancelledOrders ?? 0), returned: fmt(stats.returnedOrders ?? 0) }), icon: FiRefreshCcw, color: 'red' },
    { key: 'reviews', label: t('stats.reviews.label'), value: fmt(stats.totalFeedbacks ?? 0), title: (stats.totalFeedbacks ?? 0).toLocaleString('vi-VN'), sub: t('stats.reviews.sub', { count: fmt(stats.newFeedbacks ?? 0) }), icon: FiStar, color: 'yellow' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue:   { bg: 'bg-blue-100', text: 'text-blue-600', border: 'hover:border-blue-300 hover:shadow-blue-500/20' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'hover:border-orange-300 hover:shadow-orange-500/20' },
    emerald:{ bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'hover:border-emerald-300 hover:shadow-emerald-500/20' },
    red:    { bg: 'bg-red-100', text: 'text-red-600', border: 'hover:border-red-300 hover:shadow-red-500/20' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'hover:border-yellow-300 hover:shadow-yellow-500/20' },
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
      {cards.map((card) => {
        const c = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div key={card.key} onClick={() => onOpenModal(card.key)}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer sm:hover:scale-[1.02] transition-all duration-300 h-full flex flex-col justify-between ${c.border}`}>
            <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3">
              <p className="text-muted text-xs sm:text-base font-semibold leading-tight line-clamp-2">{card.label}</p>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                <Icon className="text-base sm:text-lg" />
              </div>
            </div>
            <div>
              <h3 className="mb-1 truncate whitespace-nowrap text-lg font-bold leading-tight tracking-tight sm:text-2xl xl:text-[1.75rem]" title={card.title}>
                {card.value}
              </h3>
              {card.sub && <div className="text-xs sm:text-sm text-muted hidden sm:block">{card.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
