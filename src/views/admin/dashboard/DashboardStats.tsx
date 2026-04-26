import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiRefreshCcw, FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import type { DashboardStatsProps } from './types';

export default function DashboardStats({ stats, onOpenModal }: DashboardStatsProps) {
  const { t } = useTranslation('adminDashboard');
  const fmt = (n: number = 0) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const cards = [
    { key: 'revenue', label: t('stats.revenue'), value: formatPrice(stats.totalRevenue ?? 0), icon: FiDollarSign, color: 'blue' },
    { key: 'orders', label: t('stats.orders.label'), value: fmt(stats.totalOrders ?? 0), sub: t('stats.orders.sub', { count: stats.newOrders ?? 0 }), icon: FiShoppingBag, color: 'blue' },
    { key: 'customers', label: t('stats.customers.label'), value: fmt(stats.totalCustomers ?? 0), sub: t('stats.customers.sub', { count: stats.newCustomers ?? 0 }), icon: FiUsers, color: 'orange' },
    { key: 'products', label: t('stats.productsSold'), value: fmt(stats.productsSold ?? 0), icon: FiBox, color: 'emerald' },
    { key: 'returns', label: t('stats.returns.label'), value: `${(stats.cancelledOrders ?? 0) + (stats.returnedOrders ?? 0)}`, sub: t('stats.returns.sub', { cancelled: stats.cancelledOrders ?? 0, returned: stats.returnedOrders ?? 0 }), icon: FiRefreshCcw, color: 'red' },
    { key: 'reviews', label: t('stats.reviews.label'), value: fmt(stats.totalFeedbacks ?? 0), sub: t('stats.reviews.sub', { count: stats.newFeedbacks ?? 0 }), icon: FiStar, color: 'yellow' },
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
              <h3 className="text-lg sm:text-2xl xl:text-[1.75rem] font-bold tracking-tight mb-1 leading-tight break-words">{card.value}</h3>
              {card.sub && <div className="text-xs sm:text-sm text-muted hidden sm:block">{card.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
