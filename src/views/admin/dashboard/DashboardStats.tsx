import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiRefreshCcw, FiStar } from 'react-icons/fi';
import { formatPrice } from '@/utils/format';
import type { DashboardStatsProps } from './types';

export default function DashboardStats({ stats, onOpenModal }: DashboardStatsProps) {
  const fmt = (n: number) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const cards = [
    { key: 'revenue', label: 'Doanh thu', value: formatPrice(stats.totalRevenue), icon: FiDollarSign, color: 'purple' },
    { key: 'orders', label: 'Tổng đơn hàng', value: fmt(stats.totalOrders), sub: `+${stats.newOrders} mới`, icon: FiShoppingBag, color: 'blue' },
    { key: 'customers', label: 'Tổng khách hàng', value: fmt(stats.totalCustomers), sub: `+${stats.newCustomers} mới`, icon: FiUsers, color: 'orange' },
    { key: 'products', label: 'SP bán ra', value: fmt(stats.productsSold), icon: FiBox, color: 'emerald' },
    { key: 'returns', label: 'Hoàn / Hủy', value: `${stats.cancelledOrders + stats.returnedOrders}`, sub: `Hủy: ${stats.cancelledOrders} | Hoàn: ${stats.returnedOrders}`, icon: FiRefreshCcw, color: 'red' },
    { key: 'reviews', label: 'Tổng đánh giá', value: fmt(stats.totalFeedbacks), sub: `+${stats.newFeedbacks} mới`, icon: FiStar, color: 'yellow' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'hover:border-purple-300 hover:shadow-purple-500/20' },
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
            className={`bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer sm:hover:scale-[1.02] transition-all duration-300 h-full flex flex-col justify-between ${c.border}`}>
            <div className="flex justify-between items-start gap-1 mb-1.5 sm:mb-2">
              <p className="text-slate-500 text-10 sm:text-sm font-medium leading-tight line-clamp-2">{card.label}</p>
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                <Icon className="text-sm sm:text-md" />
              </div>
            </div>
            <div>
              <h3 className="text-md sm:text-base xl:text-lg font-bold mb-0.5 sm:mb-1 leading-tight break-words">{card.value}</h3>
              {card.sub && <div className="text-10 sm:text-sm text-slate-500 hidden sm:block">{card.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
