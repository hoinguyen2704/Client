import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiSettings, FiBox, FiRotateCcw, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { navItems } from './Header';
import type { MobileMenuProps } from './types';

const MOBILE_NAV_IDLE_CLASS =
  'text-muted hover:bg-slate-50 dark:hover:bg-slate-800';
const MOBILE_MENU_LINK_CLASS =
  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-slate-50 dark:hover:bg-slate-800';

export default function MobileMenu({ isOpen, user, onClose, onLogout }: MobileMenuProps) {
  const { t } = useTranslation(['layout', 'common']);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (query) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      } else {
        navigate(`/search`);
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label={t('mobileMenu.closeMenu', { ns: 'layout' })}
            className="md:hidden fixed inset-0 z-[70] bg-transparent"
          />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed top-20 right-3 w-[280px] max-w-[82vw] z-[80] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-y-auto overscroll-contain max-h-[calc(100dvh-6rem)]"
          >
            <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('mobileMenu.searchPlaceholder', { ns: 'layout' })}
                onKeyDown={handleSearch}
                className="w-full h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle" />
            </div>

            {/* Mobile Nav Items */}
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' 
                        : MOBILE_NAV_IDLE_CLASS
                    }`
                  }
                >
                  {t(item.labelKey, { ns: 'layout' })}
                </NavLink>
              ))}
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              
              {/* Mobile User Actions */}
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="font-bold text-md truncate">{user.email}</p>
                    <p className="text-sm text-muted capitalize mt-0.5">
                      {user.role?.toLowerCase() === 'admin'
                        ? t('roles.admin', { ns: 'common' })
                        : t('roles.customer', { ns: 'common' })}
                    </p>
                  </div>
                  {user.role === 'admin' ? (
                    <Link to="/admin" onClick={onClose} className={MOBILE_MENU_LINK_CLASS}>
                      <FiSettings className="text-lg" /> {t('mobileMenu.adminPanel', { ns: 'layout' })}
                    </Link>
                  ) : (
                    <>
                      <Link to="/user/profile" onClick={onClose} className={MOBILE_MENU_LINK_CLASS}>
                        <FiUser className="text-lg" /> {t('mobileMenu.myAccount', { ns: 'layout' })}
                      </Link>
                      <Link to="/user/orders" onClick={onClose} className={MOBILE_MENU_LINK_CLASS}>
                        <FiBox className="text-lg" /> {t('mobileMenu.orders', { ns: 'layout' })}
                      </Link>
                      <Link to="/user/returns" onClick={onClose} className={MOBILE_MENU_LINK_CLASS}>
                        <FiRotateCcw className="text-lg" /> {t('mobileMenu.returns', { ns: 'layout' })}
                      </Link>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiLogOut className="text-lg" /> {t('mobileMenu.logout', { ns: 'layout' })}
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  <FiUser className="text-lg" /> {t('mobileMenu.loginRegister', { ns: 'layout' })}
                </Link>
              )}
            </nav>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
