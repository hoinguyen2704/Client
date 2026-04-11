import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiCreditCard, FiShoppingBag, FiRotateCcw, FiTag, FiStar, FiClock, FiBell, FiHelpCircle, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import useAuthStore from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import { useClickOutside } from '@/hooks';

const menuItems = [
  { path: '/user/profile', icon: FiUser, label: 'Hồ sơ cá nhân' },
  { path: '/user/address', icon: FiMapPin, label: 'Sổ địa chỉ' },
  { path: '/user/payment', icon: FiCreditCard, label: 'Thanh toán' },
  { path: '/user/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
  { path: '/user/returns', icon: FiRotateCcw, label: 'Trả hàng / Hoàn tiền' },
  { path: '/user/vouchers', icon: FiTag, label: 'Kho Voucher' },
  { path: '/user/reviews', icon: FiStar, label: 'Nhận xét của tôi' },
  { path: '/user/recently-viewed', icon: FiClock, label: 'Đã xem gần đây' },
  { path: '/user/notifications', icon: FiBell, label: 'Thông báo' },
  { path: '/user/settings', icon: FiSettings, label: 'Cài đặt' },
  { path: '/user/support', icon: FiHelpCircle, label: 'Hỗ trợ' },
];

export default function UserLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  useClickOutside(mobileMenuRef, useCallback(() => setIsMobileMenuOpen(false), []));

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const activeMenuItem = useMemo(
    () => menuItems.find((item) => location.pathname.startsWith(item.path)) || menuItems[0],
    [location.pathname],
  );
  const ActiveMenuIcon = activeMenuItem.icon;

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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 lg:sticky lg:top-[8.5rem] lg:max-h-[calc(100dvh-9.5rem)] lg:overflow-y-auto custom-scrollbar">
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
                <p className="text-sm sm:text-md text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </p>
              </div>
            </div>

            <div className="lg:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between text-md font-semibold"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ActiveMenuIcon className="text-base shrink-0" />
                  <span className="truncate">{activeMenuItem.label}</span>
                </span>
                <FiChevronDown className={cn('text-base text-slate-400 transition-transform', isMobileMenuOpen && 'rotate-180')} />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <nav className="p-2 space-y-1 max-h-[52dvh] overflow-y-auto">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all font-medium text-md",
                          isActive
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                        )}
                      >
                        <item.icon className="text-base" />
                        <span className="flex-1">{item.label}</span>
                        {item.path === '/user/notifications' && unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </NavLink>
                    ))}

                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all font-medium text-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiLogOut className="text-base" />
                        Đăng xuất
                      </button>
                    </div>
                  </nav>
                </div>
              )}
            </div>

            <nav className="hidden lg:block space-y-1">
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all font-medium text-base min-w-0",
                      isActive
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <item.icon className="text-lg" />
                    <span className="flex-1">{item.label}</span>
                    {item.path === '/user/notifications' && unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-start gap-2.5 px-4 py-3 rounded-xl transition-all font-medium text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
