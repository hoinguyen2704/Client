import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components';
import type { DashboardChildProps } from './types';

const CATEGORY_COLORS = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#06b6d4', '#6366f1', '#14b8a6', '#f97316'];

export default function CategoryChart({ stats }: DashboardChildProps) {
  const { t } = useTranslation('adminDashboard');
  const chartData = (stats.topCategories || []).map((cat) => ({
    name: cat.name,
    sold: cat.totalSold,
    revenue: cat.revenue,
  }));

  return (
    <Card>
      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-5 sm:mb-6">
        <span className="text-xl">📦</span> {t('overview.charts.categories.title')}
      </h2>

      {chartData.length === 0 ? (
        <div className="h-72 sm:h-96 flex items-center justify-center text-subtle">{t('overview.charts.categories.empty')}</div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-3 bg-blue-500 rounded-sm" />
            <span className="text-md text-muted">{t('overview.charts.categories.legendSold')}</span>
          </div>
          <div className="h-72 sm:h-96 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
              <BarChart data={chartData} margin={{ top: 30, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [
                    t('overview.charts.categories.tooltipValue', { count: value }),
                    t('overview.charts.categories.tooltipSeries'),
                  ]}
                />
                <Bar dataKey="sold" radius={[6, 6, 0, 0]} barSize={36} label={{ position: 'top', fontSize: 11, fontWeight: 600, fill: '#334155' }}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}
