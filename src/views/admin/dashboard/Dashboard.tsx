import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { recentOrders } from '@/__mocks__/mockDashboard';
import StatusBadge from '@/components/ui/StatusBadge';
import DashboardStats from './DashboardStats';
import RevenueChart from './RevenueChart';
import OrderChart from './OrderChart';
import CategoryChart from './CategoryChart';
import DashboardLists from './DashboardLists';
import DashboardBottom from './DashboardBottom';

export default function Dashboard() {
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

      <DashboardStats onOpenModal={setActiveModal} />
      <RevenueChart />
      <OrderChart />
      <CategoryChart />
      <DashboardLists />
      <DashboardBottom />

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
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
                              <StatusBadge status={order.status} />
                            </td>
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
