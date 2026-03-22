import { useState, useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPrice } from '@/helpers/format';
import adminDashboardService from '@/apis/services/adminDashboardService';
import type { DashboardStatsResponse, RecentOrderItem } from '@/apis/services/adminDashboardService';
import DashboardStats from './DashboardStats';
import RevenueChart from './RevenueChart';
import OrderChart from './OrderChart';
import CategoryChart from './CategoryChart';
import DashboardLists from './DashboardLists';
import DashboardBottom from './DashboardBottom';

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('MONTH');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getStats(period);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { value: 'DAY', label: 'Hôm nay' },
              { value: 'WEEK', label: 'Tuần' },
              { value: 'MONTH', label: 'Tháng' },
              { value: 'YEAR', label: 'Năm' },
            ].map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p.value ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          <DashboardStats stats={stats} onOpenModal={setActiveModal} />
          <RevenueChart stats={stats} />
          <OrderChart stats={stats} />
          <CategoryChart stats={stats} />
          <DashboardLists stats={stats} />
          <DashboardBottom stats={stats} />
        </>
      ) : (
        <div className="text-center text-slate-400 py-12">Không thể tải dữ liệu dashboard</div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModal && stats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-lg font-bold">
                  {activeModal === 'orders' && 'Đơn hàng gần đây'}
                  {activeModal === 'revenue' && 'Chi tiết doanh thu'}
                  {activeModal === 'customers' && 'Khách hàng tiềm năng'}
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
                        {stats.recentOrders.map((order: RecentOrderItem, index: number) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 font-medium">{order.orderNumber}</td>
                            <td className="py-4">{order.customerName}</td>
                            <td className="py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                            <td className="py-4 font-bold">{formatPrice(order.totalAmount)}</td>
                            <td className="py-4"><StatusBadge status={order.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">Dữ liệu chi tiết đang được cập nhật...</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
