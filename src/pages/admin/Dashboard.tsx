import { useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiBox, FiRefreshCcw, FiStar, FiChevronDown, FiMoreVertical, FiX } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const revenue7Days = [
  { name: 'T2', revenue: 4000, orders: 24 },
  { name: 'T3', revenue: 3000, orders: 18 },
  { name: 'T4', revenue: 5000, orders: 35 },
  { name: 'T5', revenue: 2780, orders: 15 },
  { name: 'T6', revenue: 6890, orders: 48 },
  { name: 'T7', revenue: 8390, orders: 60 },
  { name: 'CN', revenue: 9490, orders: 75 },
];

const revenueMonth = [
  { name: 'T1', revenue: 24000, orders: 124 },
  { name: 'T2', revenue: 33000, orders: 218 },
  { name: 'T3', revenue: 45000, orders: 335 },
  { name: 'T4', revenue: 37800, orders: 215 },
  { name: 'T5', revenue: 42000, orders: 250 },
  { name: 'T6', revenue: 55000, orders: 310 },
  { name: 'T7', revenue: 48000, orders: 280 },
  { name: 'T8', revenue: 61000, orders: 350 },
  { name: 'T9', revenue: 59000, orders: 340 },
  { name: 'T10', revenue: 72000, orders: 410 },
  { name: 'T11', revenue: 85000, orders: 480 },
  { name: 'T12', revenue: 105000, orders: 550 },
];

const revenueQuarter = [
  { name: 'Quý 1', revenue: 124000, orders: 1124 },
  { name: 'Quý 2', revenue: 133000, orders: 1218 },
  { name: 'Quý 3', revenue: 145000, orders: 1335 },
  { name: 'Quý 4', revenue: 187800, orders: 1815 },
];

const pieData = [
  { name: 'Hoàn trả', value: 30 },
  { name: 'Hủy đơn', value: 15 },
];
const PIE_COLORS = ['#f59e0b', '#ef4444'];

const recentOrders = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', date: '20/10/2023', amount: '34.990.000đ', status: 'completed' },
  { id: '#ORD-002', customer: 'Trần Thị B', date: '20/10/2023', amount: '15.990.000đ', status: 'processing' },
  { id: '#ORD-003', customer: 'Lê Văn C', date: '19/10/2023', amount: '4.990.000đ', status: 'shipping' },
  { id: '#ORD-004', customer: 'Phạm Thị D', date: '19/10/2023', amount: '2.490.000đ', status: 'cancelled' },
];

const topProducts = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', sold: 1245, revenue: '36.092.550.000đ', image: 'https://picsum.photos/seed/p1/50/50' },
  { id: 2, name: 'MacBook Pro 14 M3 Pro', sold: 856, revenue: '42.791.440.000đ', image: 'https://picsum.photos/seed/p2/50/50' },
  { id: 3, name: 'Samsung Galaxy S24 Ultra', sold: 643, revenue: '20.569.570.000đ', image: 'https://picsum.photos/seed/p3/50/50' },
  { id: 4, name: 'AirPods Pro Gen 2', sold: 2105, revenue: '12.608.950.000đ', image: 'https://picsum.photos/seed/p4/50/50' },
];

const topCategories = [
  { id: 1, name: 'Điện thoại thông minh', sold: 4521, percent: 45 },
  { id: 2, name: 'Laptop & MacBook', sold: 2145, percent: 25 },
  { id: 3, name: 'Âm thanh', sold: 3210, percent: 15 },
  { id: 4, name: 'Phụ kiện', sold: 5412, percent: 15 },
];

const topCustomers = [
  { id: 1, name: 'Trần Đại Quang', spent: '156.450.000đ', orders: 12, avatar: 'https://picsum.photos/seed/u1/50/50' },
  { id: 2, name: 'Lê Thị Hoa', spent: '98.200.000đ', orders: 8, avatar: 'https://picsum.photos/seed/u2/50/50' },
  { id: 3, name: 'Phạm Minh Tuấn', spent: '75.500.000đ', orders: 15, avatar: 'https://picsum.photos/seed/u3/50/50' },
  { id: 4, name: 'Hoàng Văn Thái', spent: '62.100.000đ', orders: 5, avatar: 'https://picsum.photos/seed/u4/50/50' },
];

const reviewStats = {
  total: 4521,
  thisMonth: 342,
  average: 4.8,
  distribution: [
    { stars: 5, count: 3800, percent: 84 },
    { stars: 4, count: 500, percent: 11 },
    { stars: 3, count: 150, percent: 3 },
    { stars: 2, count: 50, percent: 1 },
    { stars: 1, count: 21, percent: 1 },
  ]
};

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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === '7days' ? (
              <LineChart data={revenue7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}M`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
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
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            ) : (
              <BarChart data={revenueQuarter} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}M`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            )}
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
