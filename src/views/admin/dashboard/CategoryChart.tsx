import { useState } from 'react';
import { FiChevronDown, FiCalendar, FiX } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { categoryDataMap, categoryPeriodLabels, CATEGORY_COLORS, type CategoryPeriod } from '@/utils/mockDashboard';

export default function CategoryChart() {
  const [catPeriod, setCatPeriod] = useState<CategoryPeriod>('day');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catStartDate, setCatStartDate] = useState('2025-11-06');
  const [catEndDate, setCatEndDate] = useState('2025-11-13');
  const [showDateRange, setShowDateRange] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-xl">📦</span> Thống kê số lượng hàng hóa bán
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Dropdown */}
          <div className="relative">
            <button onClick={() => { setCatDropdownOpen(!catDropdownOpen); setShowDateRange(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-w-[130px] justify-between">
              {categoryPeriodLabels[catPeriod]}
              <FiChevronDown className={`transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {catDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                {(Object.keys(categoryPeriodLabels) as CategoryPeriod[]).map((key) => (
                  <button key={key} onClick={() => { setCatPeriod(key); setCatDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${catPeriod === key ? 'text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/20' : 'text-slate-700 dark:text-slate-300'}`}>
                    {categoryPeriodLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="relative">
            <button onClick={() => { setShowDateRange(!showDateRange); setCatDropdownOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <FiCalendar className="text-slate-500" />
              <span>{new Date(catStartDate).toLocaleDateString('vi-VN')} - {new Date(catEndDate).toLocaleDateString('vi-VN')}</span>
              {(catStartDate || catEndDate) && (
                <button onClick={(e) => { e.stopPropagation(); setCatStartDate('2025-11-06'); setCatEndDate('2025-11-13'); }} className="ml-1 text-slate-400 hover:text-red-500">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </button>
            {showDateRange && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 p-4 min-w-[280px]">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Từ ngày</label>
                    <input type="date" value={catStartDate} onChange={(e) => setCatStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Đến ngày</label>
                    <input type="date" value={catEndDate} onChange={(e) => setCatEndDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <button onClick={() => setShowDateRange(false)} className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Áp dụng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-3 bg-blue-500 rounded-sm"></div>
        <span className="text-sm text-slate-500">Số lượng bán</span>
      </div>

      {/* Bar Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryDataMap[catPeriod]} margin={{ top: 30, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value} sản phẩm`, 'Số lượng bán']} />
            <Bar dataKey="sold" radius={[6, 6, 0, 0]} barSize={50} label={{ position: 'top', fontSize: 13, fontWeight: 600, fill: '#334155' }}>
              {categoryDataMap[catPeriod].map((_entry, index) => (
                <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
