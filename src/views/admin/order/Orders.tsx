import { useState } from 'react';
import { FiSearch, FiFilter, FiEye, FiMoreVertical, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/helpers/format';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockAdminOrders } from '@/utils/mockAdmin';

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <button className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2">
          <FiDownload /> Xuất danh sách
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý (Pending)</option>
            <option value="verified">Đã xác nhận (Verified)</option>
            <option value="shipping">Đang giao (Shipping)</option>
            <option value="delivered">Đã giao (Delivered)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
          <input type="date" className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none text-slate-500" />
          <button className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium">
            <FiFilter /> Lọc
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="p-4 font-medium">Mã đơn hàng</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Ngày đặt</th>
                <th className="p-4 font-medium">Tổng tiền</th>
                <th className="p-4 font-medium">Thanh toán</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockAdminOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="p-4 font-bold text-purple-600">{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{order.customer}</div>
                    <div className="text-sm text-slate-500">{order.phone}</div>
                  </td>
                  <td className="p-4 text-slate-500">{order.date}</td>
                  <td className="p-4 font-bold">{formatPrice(order.total)}</td>
                  <td className="p-4 text-slate-500">{order.payment}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/orders/${order.id}`} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg transition-colors" title="Xem chi tiết">
                        <FiEye />
                      </Link>
                      <button className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Thêm">
                        <FiMoreVertical />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1-5 của 342 đơn hàng</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
