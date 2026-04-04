import { useState, useEffect, useCallback } from 'react';
import { FiDownload } from 'react-icons/fi';
import { toast } from 'sonner';
import { StatusBadge, Modal, UserAvatar } from '@/components';
import { formatPrice, formatDate } from '@/utils/format';
import adminDashboardService from '@/apis/services/adminDashboardService';
import type { DashboardStatsResponse, RecentOrderItem, RevenueChartItem, TopCustomerItem, TopProductItem } from '@/types';
import { downloadBlob } from '@/utils/download';
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
  const [period, setPeriod] = useState('WEEK');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getStats(period);
      const data = res.data;

      // Pad Revenue/Order Chart Data
      const padRevenueChartData = (chartData: RevenueChartItem[], selectedPeriod: string) => {
        const padded: RevenueChartItem[] = [];
        const map = new Map(chartData?.map(item => [item.label, item]) || []);
        const today = new Date();

        const formatYMD = (date: Date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };

        if (selectedPeriod === 'WEEK') {
          // Tính ngày Thứ 2 đầu tuần (getDay(): 0=CN, 1=T2, ..., 6=T7)
          const dayOfWeek = today.getDay(); // 0=CN, 1=T2...
          const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(today);
          monday.setDate(today.getDate() - diffToMonday);

          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const labelKey = formatYMD(d);
            const item = map.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
            padded.push({ ...item, label: `${d.getDate()}/${d.getMonth() + 1}` });
          }
        } else if (selectedPeriod === 'MONTH') {
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(today.getFullYear(), today.getMonth(), i);
            const labelKey = formatYMD(d);
            const item = map.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
            padded.push({ ...item, label: `${i}/${today.getMonth() + 1}` });
          }
        } else if (selectedPeriod === 'YEAR') {
          for (let i = 1; i <= 12; i++) {
            const labelKey = `Tháng ${i}`;
            const item = map.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
            padded.push(item);
          }
        }
        return padded;
      };

      data.revenueChart = padRevenueChartData(data.revenueChart || [], period);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
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
          <button
            onClick={async () => {
              try {
                const blob = await adminDashboardService.exportReport(period);
                downloadBlob(blob, `revenue_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
                toast.success('Xuất báo cáo thành công!');
              } catch (err) {
                console.error(err);
                toast.error('Xuất báo cáo thất bại!');
              }
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 print:hidden"
          >
            <FiDownload /> Xuất báo cáo
          </button>
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

      <Modal
        open={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'orders' ? 'Đơn hàng gần đây' :
          activeModal === 'revenue' ? 'Chi tiết doanh thu' :
          activeModal === 'customers' ? 'Khách hàng tiềm năng' :
          activeModal === 'products' ? 'Sản phẩm bán chạy' :
          activeModal === 'returns' ? 'Thống kê Hoàn / Hủy' :
          activeModal === 'reviews' ? 'Tổng quan đánh giá' : ''
        }
        size="xl"
        scrollable
      >
        {activeModal && stats && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={async () => {
                  if (!activeModal) return;
                  try {
                    toast.loading('Đang tạo báo cáo PDF...', { id: 'pdf-report' });
                    const blob = await adminDashboardService.exportReportPdf(activeModal, period);
                    downloadBlob(blob, `report_${activeModal}_${new Date().toISOString().slice(0, 10)}.pdf`);
                    toast.success('Xuất báo cáo PDF thành công!', { id: 'pdf-report' });
                  } catch (err) {
                    console.error(err);
                    toast.error('Xuất báo cáo thất bại!', { id: 'pdf-report' });
                  }
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <FiDownload /> Tải PDF
              </button>
            </div>

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
            ) : activeModal === 'revenue' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                      <th className="pb-3 font-medium">Thời gian</th>
                      <th className="pb-3 font-medium text-center">Số đơn hàng</th>
                      <th className="pb-3 font-medium text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.revenueChart?.map((item: RevenueChartItem, index: number) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 font-medium">{item.label}</td>
                        <td className="py-4 text-center">{item.orders}</td>
                        <td className="py-4 text-right font-bold text-green-600">{formatPrice(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 dark:border-slate-800">
                      <td className="py-4 font-bold text-right pt-4">Tổng cộng:</td>
                      <td className="py-4 text-center font-bold pt-4">{stats.revenueChart?.reduce((acc: number, item: RevenueChartItem) => acc + item.orders, 0) || 0}</td>
                      <td className="py-4 text-right font-bold text-lg pt-4 text-green-600">
                        {formatPrice(stats.revenueChart?.reduce((acc: number, item: RevenueChartItem) => acc + item.revenue, 0) || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : activeModal === 'customers' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                      <th className="pb-3 font-medium w-16 text-center">Top</th>
                      <th className="pb-3 font-medium">Khách hàng</th>
                      <th className="pb-3 font-medium text-center">Số đơn</th>
                      <th className="pb-3 font-medium text-right">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topCustomers?.map((customer: TopCustomerItem, index: number) => (
                      <tr key={customer.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">#{index + 1}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={customer.name} size="sm" />
                            <div>
                              <p className="font-bold">{customer.name}</p>
                              <p className="text-xs text-slate-500">{customer.email || 'Không có email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center text-slate-500">{customer.totalOrders}</td>
                        <td className="py-4 text-right font-bold text-purple-600">{formatPrice(customer.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'products' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                      <th className="pb-3 font-medium w-16 text-center">Top</th>
                      <th className="pb-3 font-medium">Sản phẩm</th>
                      <th className="pb-3 font-medium text-center">Đã bán</th>
                      <th className="pb-3 font-medium text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts?.map((p: TopProductItem, index: number) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">#{index + 1}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-300">
                                ?
                              </div>
                            )}
                            <span className="font-bold">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center font-medium text-slate-600 dark:text-slate-300">{p.totalSold}</td>
                        <td className="py-4 text-right font-bold text-emerald-600">{formatPrice(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'returns' ? (
              <div className="grid grid-cols-2 gap-6 p-6">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 text-center border border-red-100 dark:border-red-900/30">
                  <p className="text-red-500 font-bold mb-2 uppercase tracking-wide">Đơn bị hủy</p>
                  <h2 className="text-6xl font-black text-red-600 mb-2">{stats.cancelledOrders}</h2>
                  <p className="text-sm text-red-600/70 font-medium">Khách hàng hủy hoặc không thanh toán thành công</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-8 text-center border border-orange-100 dark:border-orange-900/30">
                  <p className="text-orange-500 font-bold mb-2 uppercase tracking-wide">Yêu cầu hoàn trả</p>
                  <h2 className="text-6xl font-black text-orange-600 mb-2">{stats.returnedOrders}</h2>
                  <p className="text-sm text-orange-600/70 font-medium">Yêu cầu trả hàng hoàn tiền từ khách hàng</p>
                </div>
              </div>
            ) : activeModal === 'reviews' ? (
              <div className="p-8">
                <div className="flex items-center justify-center gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <h2 className="text-7xl font-black text-yellow-500">{stats.totalFeedbacks > 0 ? (
                        Object.entries(stats.ratingDistribution || {}).reduce((acc, [rating, count]) => acc + Number(rating) * count, 0) / stats.totalFeedbacks
                      ).toFixed(1) : '5.0'}</h2>
                    <div className="flex text-yellow-400 text-2xl justify-center my-3">★★★★★</div>
                    <p className="text-slate-500 font-medium">Từ {stats.totalFeedbacks} lượt đánh giá tổng hợp</p>
                  </div>
                </div>
                <div className="space-y-5 max-w-xl mx-auto">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = stats.ratingDistribution?.[stars] || 0;
                    const percent = stats.totalFeedbacks ? Math.round((count / stats.totalFeedbacks) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 w-16 text-sm font-bold text-slate-700 dark:text-slate-300">
                          {stars} <span className="text-yellow-400 text-lg leading-none">★</span>
                        </div>
                        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="w-12 text-sm font-bold text-right text-slate-600 dark:text-slate-400">
                          {percent}%
                        </div>
                        <div className="w-12 text-sm text-right text-slate-400">
                          ({count})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">Dữ liệu chi tiết đang được hiển thị...</div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
