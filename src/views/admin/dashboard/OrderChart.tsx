import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from '@/components';
import { FiShoppingBag, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import type { DashboardChildProps } from './types';
import ChartXAxisTick from './ChartXAxisTick';

export default function OrderChart({ stats }: DashboardChildProps) {
  const chartData = (stats.revenueChart || []).map((item) => ({
    name: item.label,
    orders: item.orders,
  }));

  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const maxItem = chartData.reduce((m, d) => d.orders > m.orders ? d : m, { name: '-', orders: 0 });

  // Find today's label for reference line
  const todayEntry = chartData.find((d) => d.name.includes('_TODAY'));

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FiShoppingBag className="text-xl" />
          </div>
          <h2 className="text-lg font-bold">Thống kê đơn hàng</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1 leading-tight">Tổng đơn (kỳ này)</p>
          <p className="text-sm sm:text-lg font-bold text-blue-700 dark:text-blue-400">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-1 mb-1">
            <FiCheckCircle className="text-emerald-500 text-xs" />
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Đơn mới</p>
          </div>
          <p className="text-sm sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">{stats.newOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-1 mb-1">
            <FiXCircle className="text-red-500 text-xs" />
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Hủy/Trả</p>
          </div>
          <p className="text-sm sm:text-lg font-bold text-red-700 dark:text-red-400">{(stats.cancelledOrders + stats.returnedOrders).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-1 mb-1">
            <FiTrendingUp className="text-amber-500 text-xs" />
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Cao nhất</p>
          </div>
          <p className="text-sm sm:text-lg font-bold text-amber-700 dark:text-amber-400">{maxItem.orders} <span className="text-[10px] sm:text-xs font-normal text-slate-400">({maxItem.name.split('|')[0]})</span></p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 sm:h-80 flex items-center justify-center text-slate-400">Chưa có dữ liệu đơn hàng</div>
      ) : (
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 24 }}>
              <defs>
                <linearGradient id="colorOrdersAPI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [value.toLocaleString(), 'Đơn hàng']}
                labelFormatter={(label: string) => {
                  const parts = label.replace('|_TODAY', '').split('|');
                  return parts.length > 1 ? `${parts[0]} - ${parts[1]}` : parts[0];
                }}
              />
              {todayEntry && (
                <ReferenceLine
                  x={todayEntry.name}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
              )}
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrdersAPI)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
