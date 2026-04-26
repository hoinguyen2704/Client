import { useState, useRef, useCallback } from 'react';
import { FiSearch, FiLogOut, FiUser, FiSettings, FiChevronDown, FiUsers, FiHelpCircle, FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '@/hooks';
import useUIStore from '@/stores/useUIStore';
import useAuthStore from '@/stores/useAuthStore';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import LanguageToggle from './LanguageToggle';
import type { AdminHeaderProps } from './types';

const ADMIN_HEADER_ICON_BUTTON_CLASS =
  'p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-300 text-muted transition-colors';
const ADMIN_HEADER_SIDEBAR_BUTTON_CLASS = `lg:hidden ${ADMIN_HEADER_ICON_BUTTON_CLASS}`;
const ADMIN_HEADER_PILL_BUTTON_CLASS =
  'border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700';
const ADMIN_MENU_LINK_CLASS =
  'flex items-center gap-3 px-4 py-2.5 text-md text-body hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors';

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  const { t } = useTranslation(['layout', 'common']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const user = useAuthStore((s) => s.user);
  useClickOutside(menuRef, useCallback(() => setIsMenuOpen(false), []));

  return (
    <header className="h-16 sm:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className={ADMIN_HEADER_SIDEBAR_BUTTON_CLASS}>
          <FiMenu className="text-lg sm:text-xl" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4">
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`${ADMIN_HEADER_ICON_BUTTON_CLASS} ${ADMIN_HEADER_PILL_BUTTON_CLASS}`}
          aria-label={t('adminHeader.toggleTheme', { ns: 'layout' })}
          title={t('adminHeader.toggleTheme', { ns: 'layout' })}>
          {darkMode ? <FiSun className="text-lg sm:text-xl" /> : <FiMoon className="text-lg sm:text-xl" />}
        </button>

        <LanguageToggle className={ADMIN_HEADER_PILL_BUTTON_CLASS} />

        {/* Notification Dropdown */}
        <NotificationDropdown iconSize="text-lg sm:text-xl" />

        <div className="h-7 sm:h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-2"></div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 sm:p-2 rounded-xl transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Admin" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-blue-500/15" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-blue-500/15 bg-blue-50 dark:bg-blue-950/30 sm:h-10 sm:w-10">
                <FiUser className="text-lg text-blue-600 dark:text-blue-300" />
              </div>
            )}
            <div className="hidden md:block text-md text-left">
              <p className="font-bold">{user?.name || 'Admin'}</p>
              <p className="text-muted text-sm">
                {user?.role === 'ADMIN'
                  ? t('roles.admin', { ns: 'common' })
                  : t('roles.staff', { ns: 'common' })}
              </p>
            </div>
            <FiChevronDown className={`text-subtle ml-0.5 sm:ml-1 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-[280px] max-w-[80vw] sm:w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Admin" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
                      <FiUser className="text-2xl text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-md">{user?.name || 'Admin'}</p>
                    <p className="text-sm text-muted">{user?.email || ''}</p>
                    <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-10 font-bold text-muted dark:bg-slate-800">
                      {user?.role === 'ADMIN'
                        ? t('roles.admin', { ns: 'common' })
                        : t('roles.staff', { ns: 'common' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/user/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={ADMIN_MENU_LINK_CLASS}
                >
                  <FiUser className="text-lg text-subtle" />
                  {t('adminHeader.profile', { ns: 'layout' })}
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className={ADMIN_MENU_LINK_CLASS}
                >
                  <FiSettings className="text-lg text-subtle" />
                  {t('adminHeader.settings', { ns: 'layout' })}
                </Link>
                <Link
                  to="/admin/customers"
                  onClick={() => setIsMenuOpen(false)}
                  className={ADMIN_MENU_LINK_CLASS}
                >
                  <FiUsers className="text-lg text-subtle" />
                  {t('adminHeader.accessControl', { ns: 'layout' })}
                </Link>
                <Link
                  to="/admin/tickets"
                  onClick={() => setIsMenuOpen(false)}
                  className={ADMIN_MENU_LINK_CLASS}
                >
                  <FiHelpCircle className="text-lg text-subtle" />
                  {t('adminHeader.support', { ns: 'layout' })}
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => { setIsMenuOpen(false); onLogout(); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full"
                >
                  <FiLogOut className="text-lg" />
                  {t('adminHeader.logout', { ns: 'layout' })}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
