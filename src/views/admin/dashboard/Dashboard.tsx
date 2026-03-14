import { useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiBox, FiRefreshCcw, FiStar, FiChevronDown, FiMoreVertical, FiX, FiCalendar } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  revenue7Days, revenueMonth, revenueQuarter, getChartSummary,
  pieData, PIE_COLORS,
  recentOrders, topProducts, topCategories, topCustomers, reviewStats,
  categoryDataMap, categoryPeriodLabels, CATEGORY_COLORS,
  type CategoryPeriod,
} from '@/utils/mockDashboard';

// Tooltip Component for Cards
const CardTooltip = ({ children, content }: { children: React.ReactNode, content: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 pointer-events-none"
          >
            {content}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-white dark:border-b-slate-800"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Dashboard() {
  const [chartType, setChartType] = useState<'7days' | 'month' | 'quarter'>('7days');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [catPeriod, setCatPeriod] = useState<CategoryPeriod>('day');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catStartDate, setCatStartDate] = useState('2025-11-06');
  const [catEndDate, setCatEndDate] = useState('2025-11-13');
  const [showDateRange, setShowDateRange] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <div className="flex gap-2">
          <button className="px-4 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors text-sm">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Revenue Card */}
        <CardTooltip 
          content={
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Hôm nay:</span><span className="font-bold">15.2M</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tuần này:</span><span className="font-bold">124.5M</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tháng này:</span><span className="font-bold">450.8M</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700"><span className="text-slate-500">Năm nay:</span><span className="font-bold text-purple-600">1.245M</span></div>
            </div>
          }
        >
          <div onClick={() => setActiveModal('revenue')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-purple-300 hover:scale-105 hover:shadow-purple-500/20 transition-all duration-300 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-medium">Doanh thu</p>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><FiDollarSign /></div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">1.245M</h3>
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +12.5%</span>
              </div>
            </div>
          </div>
        </CardTooltip>

        {/* Orders Card */}
        <CardTooltip 
          content={
            <div className="space-y-2 text-sm text-center">
              <p className="text-slate-500 mb-1">Tổng số đơn hàng</p>
              <p className="text-2xl font-bold text-blue-600">15,420</p>
            </div>
          }
        >
          <div onClick={() => setActiveModal('orders')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-300 hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-medium">Đơn hàng mới</p>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><FiShoppingBag /></div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">342</h3>
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +5.2%</span>
              </div>
            </div>
          </div>
        </CardTooltip>

        {/* Customers Card */}
        <CardTooltip 
          content={
            <div className="space-y-2 text-sm text-center">
              <p className="text-slate-500 mb-1">Khách hàng mới (Tháng)</p>
              <p className="text-2xl font-bold text-orange-600">+128</p>
            </div>
          }
        >
          <div onClick={() => setActiveModal('customers')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-orange-300 hover:scale-105 hover:shadow-orange-500/20 transition-all duration-300 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-medium">Tổng khách hàng</p>
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><FiUsers /></div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">12,500</h3>
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +1.2%</span>
              </div>
            </div>
          </div>
        </CardTooltip>

        {/* Products Sold Card */}
        <div onClick={() => setActiveModal('products')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-300 hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium">SP bán ra (Tháng)</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><FiBox /></div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">1,204</h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +8.4%</span>
            </div>
          </div>
        </div>

        {/* Returns/Canceled Card */}
        <CardTooltip 
          content={
            <div className="h-40 w-full flex flex-col items-center">
              <p className="text-sm font-bold mb-2">Tỷ lệ Hoàn / Hủy</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} đơn`, 'Số lượng']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Hoàn (30)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Hủy (15)</span>
              </div>
            </div>
          }
        >
          <div onClick={() => setActiveModal('returns')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-red-300 hover:scale-105 hover:shadow-red-500/20 transition-all duration-300 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-medium">Hoàn / Hủy</p>
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><FiRefreshCcw /></div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">45</h3>
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-red-500 font-medium"><FiTrendingUp className="rotate-180" /> -2.1%</span>
              </div>
            </div>
          </div>
        </CardTooltip>

        {/* Reviews Card */}
        <CardTooltip 
          content={
            <div className="space-y-2 text-sm text-center">
              <p className="text-slate-500 mb-1">Đánh giá mới (Tháng)</p>
              <p className="text-2xl font-bold text-yellow-500">+342</p>
            </div>
          }
        >
          <div onClick={() => setActiveModal('reviews')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-yellow-300 hover:scale-105 hover:shadow-yellow-500/20 transition-all duration-300 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-medium">Tổng đánh giá</p>
              <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><FiStar /></div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">4,521</h3>
              <div className="flex items-center gap-1 text-xs">
                <span className="flex items-center text-yellow-500 font-medium"><FiStar className="fill-current mr-1" /> 4.8/5</span>
              </div>
            </div>
          </div>
        </CardTooltip>
      </div>

      {/* Main Charts */}
      {(() => {
        const chartData = chartType === '7days' ? revenue7Days : chartType === 'month' ? revenueMonth : revenueQuarter;
        const summary = getChartSummary(chartData);
        const periodLabel = chartType === '7days' ? 'Tuần trước' : chartType === 'month' ? 'Năm trước' : 'Năm trước';
        return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold">Biểu đồ doanh thu</h2>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setChartType('7days')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartType === '7days' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => setChartType('month')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartType === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
            Tháng
            </button>
            <button 
              onClick={() => setChartType('quarter')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartType === 'quarter' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Quý
            </button>
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-purple-500 rounded"></div>
            <span className="text-xs text-slate-500">Kỳ này</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-500 rounded"></div>
            <span className="text-xs text-slate-400">{periodLabel}</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === '7days' ? (
              <AreaChart data={revenue7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}M`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number, name: string) => [`${value.toLocaleString()}đ`, name === 'prevRevenue' ? 'Kỳ trước' : 'Doanh thu']} />
                <Area type="monotone" dataKey="prevRevenue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="12 6" fillOpacity={0} dot={false} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevWeek)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </AreaChart>
            ) : chartType === 'month' ? (
              <AreaChart data={revenueMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
      </div>
        );
      })()}

      {/* Category Sales Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">📦</span> Thống kê số lượng hàng hóa bán
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Period Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setCatDropdownOpen(!catDropdownOpen); setShowDateRange(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-w-[130px] justify-between"
              >
                {categoryPeriodLabels[catPeriod]}
                <FiChevronDown className={`transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {catDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                  {(Object.keys(categoryPeriodLabels) as CategoryPeriod[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setCatPeriod(key); setCatDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                        catPeriod === key ? 'text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/20' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {categoryPeriodLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="relative">
              <button
                onClick={() => { setShowDateRange(!showDateRange); setCatDropdownOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <FiCalendar className="text-slate-500" />
                <span>{new Date(catStartDate).toLocaleDateString('vi-VN')} - {new Date(catEndDate).toLocaleDateString('vi-VN')}</span>
                {(catStartDate || catEndDate) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCatStartDate('2025-11-06'); setCatEndDate('2025-11-13'); }}
                    className="ml-1 text-slate-400 hover:text-red-500"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </button>
              {showDateRange && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 p-4 min-w-[280px]">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Từ ngày</label>
                      <input
                        type="date"
                        value={catStartDate}
                        onChange={(e) => setCatStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Đến ngày</label>
                      <input
                        type="date"
                        value={catEndDate}
                        onChange={(e) => setCatEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowDateRange(false)}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Áp dụng
                    </button>
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
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={13}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} sản phẩm`, 'Số lượng bán']}
              />
              <Bar dataKey="sold" radius={[6, 6, 0, 0]} barSize={50} label={{ position: 'top', fontSize: 13, fontWeight: 600, fill: '#334155' }}>
                {categoryDataMap[catPeriod].map((_entry, index) => (
                  <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Top sản phẩm bán chạy</h2>
            <button className="text-slate-400 hover:text-purple-600"><FiMoreVertical /></button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-6 text-center font-bold text-slate-400">{idx + 1}</div>
                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500">{product.sold} đã bán</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-purple-600 dark:text-purple-400">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories & Customers */}
        <div className="space-y-6">
          {/* Top Categories */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-6">Danh mục nổi bật</h2>
            <div className="space-y-4">
              {topCategories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-slate-500">{cat.sold} SP ({cat.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" style={{ width: `${cat.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-6">Khách hàng tiềm năng</h2>
            <div className="space-y-4">
              {topCustomers.slice(0, 3).map((customer) => (
                <div key={customer.id} className="flex items-center gap-4">
                  <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{customer.name}</h4>
                    <p className="text-xs text-slate-500">{customer.orders} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{customer.spent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Đơn hàng gần đây</h2>
            <button className="text-sm font-medium text-purple-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  <th className="pb-3 font-medium">Mã đơn</th>
                  <th className="pb-3 font-medium">Khách hàng</th>
                  <th className="pb-3 font-medium">Ngày đặt</th>
                  <th className="pb-3 font-medium">Tổng tiền</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 font-medium">{order.id}</td>
                    <td className="py-4">{order.customer}</td>
                    <td className="py-4 text-slate-500">{order.date}</td>
                    <td className="py-4 font-bold">{order.amount}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'processing' ? 'bg-orange-100 text-orange-600' :
                        order.status === 'shipping' ? 'bg-blue-100 text-blue-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {order.status === 'completed' ? 'Đã giao' :
                         order.status === 'processing' ? 'Chờ xử lý' :
                         order.status === 'shipping' ? 'Đang giao' : 'Đã hủy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-6">Thống kê đánh giá</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-1">
                {reviewStats.average}
              </div>
              <div className="flex justify-center text-yellow-400 text-sm mb-1">
                <FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" />
              </div>
              <div className="text-xs text-slate-500">{reviewStats.total} đánh giá</div>
            </div>
            <div className="flex-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <div className="text-sm text-slate-500 mb-1">Tháng này</div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">+{reviewStats.thisMonth}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {reviewStats.distribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-12 font-medium">
                  {dist.stars} <FiStar className="text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: `${dist.percent}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-slate-500">{dist.percent}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-lg font-bold">
                  {activeModal === 'orders' && 'Đơn hàng mới trong tháng'}
                  {activeModal === 'revenue' && 'Chi tiết doanh thu'}
                  {activeModal === 'customers' && 'Khách hàng mới trong tháng'}
                  {activeModal === 'returns' && 'Đơn hàng Hoàn / Hủy'}
                  {activeModal === 'reviews' && 'Đánh giá mới'}
                  {activeModal === 'products' && 'Sản phẩm bán ra'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {activeModal === 'orders' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                          <th className="pb-3 font-medium">Mã đơn</th>
                          <th className="pb-3 font-medium">Khách hàng</th>
                          <th className="pb-3 font-medium">Ngày đặt</th>
                          <th className="pb-3 font-medium">Tổng tiền</th>
                          <th className="pb-3 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, index) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 font-medium">{order.id}</td>
                            <td className="py-4">{order.customer}</td>
                            <td className="py-4 text-slate-500">{order.date}</td>
                            <td className="py-4 font-bold">{order.amount}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                order.status === 'completed' ? 'bg-green-100 text-green-600' :
                                order.status === 'processing' ? 'bg-orange-100 text-orange-600' :
                                order.status === 'shipping' ? 'bg-blue-100 text-blue-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {order.status === 'completed' ? 'Đã giao' :
                                 order.status === 'processing' ? 'Chờ xử lý' :
                                 order.status === 'shipping' ? 'Đang giao' : 'Đã hủy'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    Dữ liệu chi tiết đang được cập nhật...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
