import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiCreditCard, FiShoppingBag, FiTruck, FiTag, FiStar, FiClock, FiBell, FiHelpCircle, FiLogOut, FiSettings } from 'react-icons/fi';
import { cn } from '../../utils/cn';

const menuItems = [
  { path: '/user/profile', icon: FiUser, label: 'Hồ sơ cá nhân' },
  { path: '/user/address', icon: FiMapPin, label: 'Sổ địa chỉ' },
  { path: '/user/payment', icon: FiCreditCard, label: 'Thanh toán' },
  { path: '/user/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
  { path: '/user/vouchers', icon: FiTag, label: 'Kho Voucher' },
  { path: '/user/reviews', icon: FiStar, label: 'Nhận xét của tôi' },
  { path: '/user/recently-viewed', icon: FiClock, label: 'Đã xem gần đây' },
  { path: '/user/notifications', icon: FiBell, label: 'Thông báo' },
  { path: '/user/settings', icon: FiSettings, label: 'Cài đặt' },
  { path: '/user/support', icon: FiHelpCircle, label: 'Hỗ trợ' },
];

export default function UserLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload(); // Force reload to update MainLayout state
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 p-1">
                <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Nguyễn Văn A</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Thành viên Bạc</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                    isActive 
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <item.icon className="text-lg" />
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiLogOut className="text-lg" />
                  Đăng xuất
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
