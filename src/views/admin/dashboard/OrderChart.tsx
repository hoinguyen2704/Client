import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ordersWeek, ordersMonth, ordersQuarter, getOrderSummary } from '@/utils/mockDashboard';
import Card from '@/components/ui/Card';
import { FiShoppingBag, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

type ChartPeriod = 'week' | 'month' | 'quarter';

const periodConfig: Record<ChartPeriod, { label: string; prevLabel: string; data: typeof ordersWeek }> = {
  week: { label: 'Tuần', prevLabel: 'Tuần trước', data: ordersWeek },
  month: { label: 'Tháng', prevLabel: 'Năm trước', data: ordersMonth },
  quarter: { label: 'Quý', prevLabel: 'Năm trước', data: ordersQuarter },
};

export default function OrderChart() {
  const [period, setPeriod] = useState<ChartPeriod>('week');

  const { data, prevLabel } = periodConfig[period];
  const summary = getOrderSummary(data);

  return (
    <Card>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FiShoppingBag className="text-xl" />
          </div>
          <h2 className="text-lg font-bold">Thống kê đơn hàng</h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(Object.keys(periodConfig) as ChartPeriod[]).map((key) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === key ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              {periodConfig[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng đơn</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{summary.totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <FiCheckCircle className="text-emerald-500 text-xs" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Thành công</p>
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary.successRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-2xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <FiXCircle className="text-red-500 text-xs" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Hủy/Trả</p>
          </div>
          <p className="text-lg font-bold text-red-700 dark:text-red-400">{summary.totalCancelled.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <FiTrendingUp className="text-amber-500 text-xs" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Cao nhất</p>
          </div>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{summary.peakVal} <span className="text-xs font-normal text-slate-400">({summary.peakDay})</span></p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Đơn thành công</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <span className="w-3 h-3 rounded-full bg-red-400"></span>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">Đơn hủy/trả</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="w-5 h-0 border-t-2 border-dashed border-slate-400"></span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{prevLabel}</span>
        </span>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#475569" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = { orders: 'Đơn thành công', cancelled: 'Đơn hủy/trả', prevOrders: 'Kỳ trước' };
                return [value.toLocaleString(), labels[name] || name];
              }}
            />
            <Area type="monotone" dataKey="prevOrders" stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 4" fillOpacity={0} dot={false} />
            <Area type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCancelled)" dot={{ r: 3, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
            <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
