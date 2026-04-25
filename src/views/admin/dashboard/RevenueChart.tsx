import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components';
import { formatPrice } from '@/utils/format';
import type { DashboardChildProps } from './types';
import ChartXAxisTick from './ChartXAxisTick';

export default function RevenueChart({ stats }: DashboardChildProps) {
  const { t } = useTranslation('adminDashboard');
  const chartData = (stats.revenueChart || []).map((item) => ({
    name: item.label,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const total = chartData.reduce((s, d) => s + d.revenue, 0);
  const avg = chartData.length > 0 ? total / chartData.length : 0;
  const maxItem = chartData.reduce((m, d) => d.revenue > m.revenue ? d : m, { name: '-', revenue: 0 });

  // Find today's label for reference line
  const todayEntry = chartData.find((d) => d.name.includes('_TODAY'));

  return (
    <Card>
      <h2 className="text-base sm:text-lg font-bold mb-4">{t('overview.charts.revenue.title')}</h2>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-2.5 sm:p-4">
          <p className="text-10 sm:text-sm text-muted mb-1 leading-tight">{t('overview.charts.revenue.summaryTotal')}</p>
          <p className="text-md sm:text-lg font-bold text-blue-700 dark:text-blue-400">{total >= 1e6 ? `${(total / 1e6).toFixed(0)}M` : total.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-2.5 sm:p-4">
          <p className="text-10 sm:text-sm text-muted mb-1 leading-tight">{t('overview.charts.revenue.summaryAverage')}</p>
          <p className="text-md sm:text-lg font-bold text-blue-700 dark:text-blue-400">{avg >= 1e6 ? `${(avg / 1e6).toFixed(0)}M` : avg.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-2.5 sm:p-4">
          <p className="text-10 sm:text-sm text-muted mb-1 leading-tight">{t('overview.charts.revenue.summaryPeak', { label: maxItem.name.split('|')[0] })}</p>
          <p className="text-md sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">{maxItem.revenue >= 1e6 ? `${(maxItem.revenue / 1e6).toFixed(0)}M` : maxItem.revenue.toLocaleString()}</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 sm:h-80 flex items-center justify-center text-subtle">{t('overview.charts.revenue.empty')}</div>
      ) : (
        <div className="h-64 sm:h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 24 }}>
              <defs><linearGradient id="colorRevAPI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
              <XAxis
                dataKey="name"
                stroke="#475569"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={<ChartXAxisTick />}
                height={48}
              />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v >= 1e6 ? `${v/1e6}M` : v}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatPrice(value), t('overview.charts.revenue.tooltipSeries')]}
                labelFormatter={(label: string) => {
                  const parts = label.replace('|_TODAY', '').split('|');
                  return parts.length > 1 ? `${parts[0]} - ${parts[1]}` : parts[0];
                }}
              />
              {todayEntry && (
                <ReferenceLine
                  x={todayEntry.name}
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
              )}
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevAPI)" dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
