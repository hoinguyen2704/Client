import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiShoppingBag, FiDollarSign, FiStar } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';

const mockCustomer = {
  id: 1,
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0987654321',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
  joinDate: '15/01/2023',
  status: 'active',
  avatar: 'https://picsum.photos/seed/user1/150/150',
  stats: {
    totalOrders: 12,
    totalSpent: 154000000,
    averageOrderValue: 12833333,
    rank: 'Khách hàng VIP'
  },
  recentOrders: [
    { id: 'ORD-20231025-001', date: '25/10/2023', total: 34990000, status: 'delivered', items: 2 },
    { id: 'ORD-20230915-088', date: '15/09/2023', total: 2490000, status: 'delivered', items: 1 },
    { id: 'ORD-20230802-045', date: '02/08/2023', total: 15990000, status: 'cancelled', items: 1 },
  ]
};

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer] = useState(mockCustomer);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/customers" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <FiArrowLeft className="text-xl" />
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <div className="relative inline-block mb-4">
              <img src={customer.avatar} alt={customer.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${customer.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <h2 className="text-xl font-bold mb-1">{customer.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{customer.stats.rank}</p>
            
            <div className="flex justify-center gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                customer.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {customer.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
              </span>
            </div>

            <div className="space-y-3 text-left text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiMail className="text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiPhone className="text-slate-400 shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <FiMapPin className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customer.address}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiCalendar className="text-slate-400 shrink-0" />
                <span>Tham gia: {customer.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <FiShoppingBag />
                </div>
                <div className="text-sm font-medium text-slate-500">Tổng đơn</div>
              </div>
              <div className="text-xl font-bold">{customer.stats.totalOrders}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <FiDollarSign />
                </div>
                <div className="text-sm font-medium text-slate-500">Chi tiêu</div>
              </div>
              <div className="text-xl font-bold text-purple-600">{formatPrice(customer.stats.totalSpent)}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">Lịch sử mua hàng</h2>
              <Link to="/admin/orders" className="text-sm font-medium text-purple-600 hover:underline">Xem tất cả</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                    <th className="p-4 font-medium">Mã đơn</th>
                    <th className="p-4 font-medium">Ngày đặt</th>
                    <th className="p-4 font-medium text-center">Số SP</th>
                    <th className="p-4 font-medium text-right">Tổng tiền</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <Link to={`/admin/orders/${order.id}`} className="font-bold text-purple-600 hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-500">{order.date}</td>
                      <td className="p-4 text-center font-medium">{order.items}</td>
                      <td className="p-4 text-right font-bold">{formatPrice(order.total)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.status === 'delivered' ? 'Đã giao' :
                           order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {customer.recentOrders.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Khách hàng này chưa có đơn hàng nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
