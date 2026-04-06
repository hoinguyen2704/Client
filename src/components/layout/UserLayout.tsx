import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiCreditCard, FiShoppingBag, FiTruck, FiTag, FiStar, FiClock, FiBell, FiHelpCircle, FiLogOut, FiSettings } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import useAuthStore from '@/stores/useAuthStore';

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
  const { user } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload(); // Force reload to update MainLayout state
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 py-5 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 shrink-0 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <FiUser className="text-xl sm:text-2xl text-purple-500 dark:text-purple-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg truncate">{user?.name || 'Thành viên'}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </p>
              </div>
            </div>

            <nav className="space-y-0 lg:space-y-1">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 hide-scrollbar">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all font-medium text-sm shrink-0 min-w-max lg:min-w-0 lg:px-4 lg:py-3 lg:text-base",
                      isActive
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <item.icon className="text-base lg:text-lg" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center lg:justify-start gap-2.5 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiLogOut className="text-base lg:text-lg" />
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
