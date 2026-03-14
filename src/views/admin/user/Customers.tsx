import { useState } from 'react';
import { FiSearch, FiFilter, FiMoreVertical, FiMail, FiPhone, FiEye, FiLock, FiUnlock, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/mockData';

const mockCustomers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0987654321', totalOrders: 12, totalSpent: 154000000, status: 'active', joinDate: '15/01/2023', avatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', totalOrders: 5, totalSpent: 45000000, status: 'active', joinDate: '20/03/2023', avatar: 'https://picsum.photos/seed/user2/100/100' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0909090909', totalOrders: 1, totalSpent: 4990000, status: 'banned', joinDate: '05/11/2023', avatar: 'https://picsum.photos/seed/user3/100/100' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0988888888', totalOrders: 0, totalSpent: 0, status: 'active', joinDate: '10/11/2023', avatar: 'https://picsum.photos/seed/user4/100/100' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0977777777', totalOrders: 24, totalSpent: 320000000, status: 'vip', joinDate: '01/12/2022', avatar: 'https://picsum.photos/seed/user5/100/100' },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const handleToggleLock = (customer: any) => {
    setSelectedCustomer(customer);
    setIsLockModalOpen(true);
  };

  const confirmToggleLock = () => {
    // Logic to lock/unlock user
    setIsLockModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <button className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2">
          Xuất danh sách
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, số điện thoại..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <div className="flex gap-2">
          <select className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Bị khóa</option>
            <option value="vip">Khách hàng VIP</option>
          </select>
          <button className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium">
            <FiFilter /> Lọc
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Liên hệ</th>
                <th className="p-4 font-medium text-center">Đơn hàng</th>
                <th className="p-4 font-medium text-right">Tổng chi tiêu</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-800" />
                      <div>
                        <div className="font-bold">{customer.name}</div>
                        <div className="text-xs text-slate-500">Tham gia: {customer.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <FiMail className="text-slate-400" /> {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FiPhone className="text-slate-400" /> {customer.phone}
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold">{customer.totalOrders}</td>
                  <td className="p-4 text-right font-bold text-purple-600">{formatPrice(customer.totalSpent)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      customer.status === 'active' ? 'bg-green-100 text-green-600' :
                      customer.status === 'vip' ? 'bg-purple-100 text-purple-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {customer.status === 'active' ? 'Hoạt động' :
                       customer.status === 'vip' ? 'VIP' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/customers/${customer.id}`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Xem chi tiết">
                        <FiEye />
                      </Link>
                      <button 
                        onClick={() => handleToggleLock(customer)}
                        className={`p-2 rounded-lg transition-colors ${
                          customer.status === 'banned' 
                            ? 'text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' 
                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={customer.status === 'banned' ? 'Mở khóa' : 'Khóa tài khoản'}
                      >
                        {customer.status === 'banned' ? <FiUnlock /> : <FiLock />}
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
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
          <div>Hiển thị 1-5 của 1,248 khách hàng</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">&gt;</button>
          </div>
        </div>
      </div>

      {/* Lock/Unlock Modal */}
      {isLockModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">
                {selectedCustomer.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
              </h3>
              <button onClick={() => setIsLockModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300">
                Bạn có chắc chắn muốn {selectedCustomer.status === 'banned' ? 'mở khóa' : 'khóa'} tài khoản của khách hàng <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</span>?
              </p>
              {selectedCustomer.status !== 'banned' && (
                <p className="text-sm text-red-500 mt-2">
                  Khách hàng sẽ không thể đăng nhập và mua hàng cho đến khi được mở khóa.
                </p>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsLockModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Hủy
              </button>
              <button 
                onClick={confirmToggleLock} 
                className={`px-6 py-2.5 rounded-xl text-white font-medium transition-colors ${
                  selectedCustomer.status === 'banned' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
