import { useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiRefreshCcw, FiStar } from 'react-icons/fi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AnimatePresence, motion } from 'motion/react';
import { pieData, PIE_COLORS } from '@/utils/mockDashboard';
import type { DashboardStatsProps } from './types';

const CardTooltip = ({ children, content }: { children: React.ReactNode; content: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="relative h-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
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

export default function DashboardStats({ onOpenModal }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Revenue Card */}
      <CardTooltip content={
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Hôm nay:</span><span className="font-bold">15.2M</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tuần này:</span><span className="font-bold">124.5M</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tháng này:</span><span className="font-bold">450.8M</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700"><span className="text-slate-500">Năm nay:</span><span className="font-bold text-purple-600">1.245M</span></div>
        </div>
      }>
        <div onClick={() => onOpenModal('revenue')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-purple-300 hover:scale-105 hover:shadow-purple-500/20 transition-all duration-300 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium">Doanh thu</p>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><FiDollarSign /></div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">1.245M</h3>
            <div className="flex items-center gap-1 text-xs"><span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +12.5%</span></div>
          </div>
        </div>
      </CardTooltip>

      {/* Orders Card */}
      <CardTooltip content={<div className="space-y-2 text-sm text-center"><p className="text-slate-500 mb-1">Đơn hàng mới (Tháng)</p><p className="text-2xl font-bold text-blue-600">+342</p></div>}>
        <div onClick={() => onOpenModal('orders')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-300 hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium">Tổng đơn hàng</p>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><FiShoppingBag /></div>
          </div>
          <div><h3 className="text-xl font-bold mb-1">15,420</h3><div className="flex items-center gap-1 text-xs"><span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +5.2%</span></div></div>
        </div>
      </CardTooltip>

      {/* Customers Card */}
      <CardTooltip content={<div className="space-y-2 text-sm text-center"><p className="text-slate-500 mb-1">Khách hàng mới (Tháng)</p><p className="text-2xl font-bold text-orange-600">+128</p></div>}>
        <div onClick={() => onOpenModal('customers')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-orange-300 hover:scale-105 hover:shadow-orange-500/20 transition-all duration-300 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium">Tổng khách hàng</p>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><FiUsers /></div>
          </div>
          <div><h3 className="text-xl font-bold mb-1">12,500</h3><div className="flex items-center gap-1 text-xs"><span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +1.2%</span></div></div>
        </div>
      </CardTooltip>

      {/* Products Sold Card */}
      <div onClick={() => onOpenModal('products')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-300 hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <p className="text-slate-500 text-xs font-medium">SP bán ra (Tháng)</p>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><FiBox /></div>
        </div>
        <div><h3 className="text-xl font-bold mb-1">1,204</h3><div className="flex items-center gap-1 text-xs"><span className="flex items-center text-green-500 font-medium"><FiTrendingUp /> +8.4%</span></div></div>
      </div>

      {/* Returns/Canceled Card */}
      <CardTooltip content={
        <div className="h-40 w-full flex flex-col items-center">
          <p className="text-sm font-bold mb-2">Tỷ lệ Hoàn / Hủy</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">{pieData.map((_entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(value) => [`${value} đơn`, 'Số lượng']} /></PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Hoàn (30)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Hủy (15)</span>
          </div>
        </div>
      }>
        <div onClick={() => onOpenModal('returns')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-red-300 hover:scale-105 hover:shadow-red-500/20 transition-all duration-300 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium">Hoàn / Hủy</p>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><FiRefreshCcw /></div>
          </div>
          <div><h3 className="text-xl font-bold mb-1">45</h3><div className="flex items-center gap-1 text-xs"><span className="flex items-center text-red-500 font-medium"><FiTrendingUp className="rotate-180" /> -2.1%</span></div></div>
        </div>
      </CardTooltip>

      {/* Reviews Card */}
      <CardTooltip content={<div className="space-y-2 text-sm text-center"><p className="text-slate-500 mb-1">Đánh giá mới (Tháng)</p><p className="text-2xl font-bold text-yellow-500">+342</p></div>}>
        <div onClick={() => onOpenModal('reviews')} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-yellow-300 hover:scale-105 hover:shadow-yellow-500/20 transition-all duration-300 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-xs font-medium">Tổng đánh giá</p>
            <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><FiStar /></div>
          </div>
          <div><h3 className="text-xl font-bold mb-1">4,521</h3><div className="flex items-center gap-1 text-xs"><span className="flex items-center text-yellow-500 font-medium"><FiStar className="fill-current mr-1" /> 4.8/5</span></div></div>
        </div>
      </CardTooltip>
    </div>
  );
}
