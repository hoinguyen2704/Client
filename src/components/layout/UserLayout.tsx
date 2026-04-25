import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FiUser, FiMapPin, FiCreditCard, FiShoppingBag, FiRotateCcw, FiTag, FiStar, FiClock, FiBell, FiHelpCircle, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import useAuthStore from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import { useClickOutside } from '@/hooks';

const USER_LAYOUT_IDLE_ITEM_CLASS =
  "text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-ink";

const menuItems = [
  { path: '/user/profile', icon: FiUser, labelKey: 'userLayout.menu.profile' },
  { path: '/user/address', icon: FiMapPin, labelKey: 'userLayout.menu.address' },
  { path: '/user/payment', icon: FiCreditCard, labelKey: 'userLayout.menu.payment' },
  { path: '/user/orders', icon: FiShoppingBag, labelKey: 'userLayout.menu.orders' },
  { path: '/user/returns', icon: FiRotateCcw, labelKey: 'userLayout.menu.returns' },
  { path: '/user/vouchers', icon: FiTag, labelKey: 'userLayout.menu.vouchers' },
  { path: '/user/reviews', icon: FiStar, labelKey: 'userLayout.menu.reviews' },
  { path: '/user/recently-viewed', icon: FiClock, labelKey: 'userLayout.menu.recentlyViewed' },
  { path: '/user/notifications', icon: FiBell, labelKey: 'userLayout.menu.notifications' },
  { path: '/user/settings', icon: FiSettings, labelKey: 'userLayout.menu.settings' },
  { path: '/user/support', icon: FiHelpCircle, labelKey: 'userLayout.menu.support' },
];

export default function UserLayout() {
  const { t } = useTranslation(['layout', 'common']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
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
    logout();
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-8 lg:px-12 py-5 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 lg:sticky lg:top-[8.5rem] lg:max-h-[calc(100dvh-9.5rem)] lg:overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 p-0.5 sm:h-14 sm:w-14">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-blue-50 dark:border-slate-900 dark:bg-blue-950/30">
                    <FiUser className="text-xl text-blue-600 dark:text-blue-300 sm:text-2xl" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg truncate">
                  {user?.name || t('roles.member', { ns: 'common' })}
                </h3>
                <p className="text-sm sm:text-md text-muted truncate">
                  {user?.role === 'ADMIN'
                    ? t('roles.admin', { ns: 'common' })
                    : t('roles.customer', { ns: 'common' })}
                </p>
              </div>
            </div>

            <div className="lg:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-body flex items-center justify-between text-md font-semibold"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ActiveMenuIcon className="text-base shrink-0" />
                  <span className="truncate">{t(activeMenuItem.labelKey, { ns: 'layout' })}</span>
                </span>
                <FiChevronDown className={cn('text-base text-subtle transition-transform', isMobileMenuOpen && 'rotate-180')} />
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
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                            : USER_LAYOUT_IDLE_ITEM_CLASS
                        )}
                      >
                        <item.icon className="text-base" />
                        <span className="flex-1">{t(item.labelKey, { ns: 'layout' })}</span>
                        {item.path === '/user/notifications' && unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-10 font-bold flex items-center justify-center rounded-full">
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
                        {t('userLayout.menu.logout', { ns: 'layout' })}
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
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                        : USER_LAYOUT_IDLE_ITEM_CLASS
                    )}
                  >
                    <item.icon className="text-lg" />
                    <span className="flex-1">{t(item.labelKey, { ns: 'layout' })}</span>
                    {item.path === '/user/notifications' && unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-10 font-bold flex items-center justify-center rounded-full">
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
                  {t('userLayout.menu.logout', { ns: 'layout' })}
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
