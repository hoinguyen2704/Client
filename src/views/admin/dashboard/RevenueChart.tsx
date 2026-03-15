import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { revenue7Days, revenueMonth, revenueQuarter, getChartSummary } from '@/utils/mockDashboard';
import Card from '@/components/ui/Card';

export default function RevenueChart() {
  const [chartType, setChartType] = useState<'7days' | 'month' | 'quarter'>('7days');

  const chartData = chartType === '7days' ? revenue7Days : chartType === 'month' ? revenueMonth : revenueQuarter;
  const summary = getChartSummary(chartData);
  const periodLabel = chartType === '7days' ? 'Tuần trước' : 'Năm trước';

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold">Biểu đồ doanh thu</h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['7days', 'month', 'quarter'] as const).map((type) => (
            <button key={type} onClick={() => setChartType(type)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartType === type ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              {type === '7days' ? 'Tuần' : type === 'month' ? 'Tháng' : 'Quý'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng doanh thu</p>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{(summary.total / 1000).toFixed(0)}M</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trung bình</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{(summary.avg / 1000).toFixed(0)}M</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cao nhất ({summary.maxDay})</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{(summary.maxVal / 1000).toFixed(0)}M</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-purple-500 rounded"></div><span className="text-xs text-slate-500">Kỳ này</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed border-amber-500 rounded"></div><span className="text-xs text-slate-400">{periodLabel}</span></div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === '7days' ? (
            <AreaChart data={revenue7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs><linearGradient id="colorRevWeek" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}M`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number, name: string) => [`${value.toLocaleString()}đ`, name === 'prevRevenue' ? 'Kỳ trước' : 'Doanh thu']} />
              <Area type="monotone" dataKey="prevRevenue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="12 6" fillOpacity={0} dot={false} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevWeek)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </AreaChart>
          ) : chartType === 'month' ? (
            <AreaChart data={revenueMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}M`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number, name: string) => [`${value.toLocaleString()}đ`, name === 'prevRevenue' ? 'Năm trước' : 'Doanh thu']} />
              <Area type="monotone" dataKey="prevRevenue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="12 6" fillOpacity={0} dot={false} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </AreaChart>
          ) : (
            <BarChart data={revenueQuarter} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}M`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number, name: string) => [`${value.toLocaleString()}đ`, name === 'prevRevenue' ? 'Năm trước' : 'Doanh thu']} />
              <Bar dataKey="prevRevenue" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
