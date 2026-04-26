import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components';
import type { DashboardChildProps } from './types';
import {
  DASHBOARD_CHART_AXIS_COLOR,
  DASHBOARD_CHART_GRID_COLOR,
  DASHBOARD_CHART_TOOLTIP_STYLE,
  formatOrderAxisValue,
  getYAxisWidth,
} from './chartUtils';

const CATEGORY_COLORS = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#06b6d4', '#6366f1', '#14b8a6', '#f97316'];

export default function CategoryChart({ stats }: DashboardChildProps) {
  const { t } = useTranslation('adminDashboard');
  const chartData = (stats.topCategories || []).map((cat) => ({
    name: cat.name,
    sold: cat.totalSold,
    revenue: cat.revenue,
  }));
  const maxLabelLength = chartData.reduce((maxLength, item) => Math.max(maxLength, item.name.length), 0);
  const shouldTiltLabels = chartData.length > 6 || maxLabelLength > 12;
  const slotWidth = shouldTiltLabels ? 120 : 100;
  const chartMinWidth = Math.max(640, chartData.length * slotWidth);
  const yAxisWidth = getYAxisWidth(chartData.map((item) => item.sold), formatOrderAxisValue, 52, 88);
  const xAxisHeight = shouldTiltLabels ? 88 : 56;

  return (
    <Card>
      <h2 className="text-body sm:text-lg font-bold flex items-center gap-2 mb-5 sm:mb-6">
        <span className="text-xl">📦</span> {t('overview.charts.categories.title')}
      </h2>

      {chartData.length === 0 ? (
        <div className="h-72 sm:h-96 flex items-center justify-center text-body">{t('overview.charts.categories.empty')}</div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-3 bg-blue-500 rounded-sm" />
            <span className="text-md text-muted">{t('overview.charts.categories.legendSold')}</span>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="h-72 min-w-0 sm:h-96" style={{ minWidth: `${chartMinWidth}px` }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={chartMinWidth} minHeight={288}>
                <BarChart data={chartData} margin={{ top: 30, right: 28, left: 10, bottom: shouldTiltLabels ? 28 : 12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={DASHBOARD_CHART_GRID_COLOR} />
                  <XAxis
                    dataKey="name"
                    stroke={DASHBOARD_CHART_AXIS_COLOR}
                    fontSize={16}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    height={xAxisHeight}
                    tickMargin={12}
                    angle={shouldTiltLabels ? -24 : 0}
                    textAnchor={shouldTiltLabels ? 'end' : 'middle'}
                  />
                  <YAxis
                    stroke={DASHBOARD_CHART_AXIS_COLOR}
                    fontSize={20}
                    width={yAxisWidth}
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tickFormatter={formatOrderAxisValue}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    wrapperStyle={{ outline: 'none' }}
                    contentStyle={DASHBOARD_CHART_TOOLTIP_STYLE}
                    formatter={(value: number) => [
                      t('overview.charts.categories.tooltipValue', { count: value }),
                      t('overview.charts.categories.tooltipSeries'),
                    ]}
                  />
                  <Bar
                    dataKey="sold"
                    radius={[8, 8, 0, 0]}
                    barSize={76}
                    maxBarSize={80}
                    label={{ position: 'top', fontSize: 16, fontWeight: 700, fill: '#334155' }}
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
