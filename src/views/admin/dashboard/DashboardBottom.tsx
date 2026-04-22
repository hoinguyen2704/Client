import { FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { StatusBadge, Card } from '@/components';
import { formatPrice, formatDate } from '@/utils/format';
import type { DashboardChildProps } from './types';

export default function DashboardBottom({ stats }: DashboardChildProps) {
  const { t } = useTranslation('adminDashboard');
  // Build rating distribution from API data
  const ratingDist = stats.ratingDistribution || {};
  const totalReviews = Object.values(ratingDist).reduce((s, c) => s + c, 0) || 1;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratingDist[stars] || 0,
    percent: Math.round(((ratingDist[stars] || 0) / totalReviews) * 100),
  }));
  const avgRating = totalReviews > 0
    ? (Object.entries(ratingDist).reduce((s, [k, v]) => s + Number(k) * v, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Recent Orders */}
      <Card className="lg:col-span-2 overflow-hidden">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold">{t('overview.bottom.recentOrdersTitle')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                <th className="pb-3 font-medium">{t('tables.orders.orderNumber')}</th>
                <th className="pb-3 font-medium">{t('tables.orders.customer')}</th>
                <th className="pb-3 font-medium">{t('tables.orders.orderDate')}</th>
                <th className="pb-3 font-medium">{t('tables.orders.total')}</th>
                <th className="pb-3 font-medium">{t('tables.orders.status')}</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentOrders || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {t('overview.bottom.emptyOrders')}
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 font-medium">{order.orderNumber}</td>
                    <td className="py-4">{order.customerName}</td>
                    <td className="py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                    <td className="py-4 font-bold">{formatPrice(order.totalAmount)}</td>
                    <td className="py-4"><StatusBadge status={order.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Stats */}
      <Card>
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">{t('overview.bottom.reviewsTitle')}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-1">{avgRating}</div>
            <div className="flex justify-center text-yellow-400 text-md mb-1">
              {Array.from({ length: 5 }).map((_, i) => <FiStar key={i} className="fill-current" />)}
            </div>
            <div className="text-sm text-slate-500">{t('overview.bottom.totalReviews', { count: totalReviews })}</div>
          </div>
          <div className="flex-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <div className="text-md text-slate-500 mb-1">{t('overview.bottom.monthThis')}</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">+{stats.newFeedbacks}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-3 text-md">
              <div className="flex items-center gap-1 w-12 font-medium">{dist.stars} <FiStar className="text-yellow-400 fill-current" /></div>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${dist.percent}%` }} />
              </div>
              <div className="w-12 text-right text-slate-500">{dist.percent}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
