import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiLogOut, FiSettings, FiBox, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../ui/LogoIcon';
import LanguageToggle from './LanguageToggle';
import useCartStore from '@/stores/useCartStore';
import useWishlistStore from '@/stores/useWishlistStore';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { useClickOutside } from '@/hooks';
import type { HeaderProps } from './types';
import { SHOP } from '@/constants/shopConstants';

const navItems = [
  { path: '/', labelKey: 'navigation.home' },
  { path: '/products', labelKey: 'navigation.products' },
  { path: '/compare', labelKey: 'navigation.compare' },
  { path: '/flash-sale', labelKey: 'navigation.promotions' },
  { path: '/contact', labelKey: 'navigation.contact' },
  { path: '/blog', labelKey: 'navigation.blog' },
];

export { navItems };

const ICON_BUTTON_CLASS =
  'p-2 text-body-soft hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-colors';
const HEADER_PILL_BUTTON_CLASS =
  'border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700';
const USER_MENU_LINK_CLASS =
  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-md font-medium text-body-soft hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors';

export default function Header({ user, theme, toggleTheme, onMenuToggle, onLogout }: HeaderProps) {
  const { t } = useTranslation(['layout', 'common']);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const wishlistCount = useWishlistStore((s) => s.totalItems);
  const syncWishlist = useWishlistStore((s) => s.syncFromServer);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, useCallback(() => setIsUserMenuOpen(false), []));

  // Sync cart and wishlist count from server on mount
  useEffect(() => { 
    syncFromServer(); 
    syncWishlist();
  }, [syncFromServer, syncWishlist]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (query) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      } else {
        navigate(`/search`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="h-20 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
              <LogoIcon />
            <span className="hidden text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-300 sm:block">
              {SHOP.name}
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:flex relative group">
            <input
              type="text"
              placeholder={t('header.searchPlaceholder', { ns: 'layout' })}
              onKeyDown={handleSearch}
              className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-blue-600 transition-colors" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleTheme}
              className={ICON_BUTTON_CLASS}
              aria-label={t('header.toggleTheme', { ns: 'layout' })}
            >
              {theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl" />}
            </button>
            <LanguageToggle className={HEADER_PILL_BUTTON_CLASS} />
            {user && (
              <NotificationDropdown iconSize="text-xl" />
            )}
            <button className={`md:hidden ${ICON_BUTTON_CLASS}`}>
              <FiSearch className="text-xl" />
            </button>
            <Link to="/wishlist" className="p-2 text-body-soft hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 rounded-xl transition-colors relative">
              <FiHeart className="text-xl" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
              )}
            </Link>
            <Link to="/cart" className="p-2 text-body-soft hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors relative">
              <FiShoppingCart className="text-xl" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-sm text-white shadow-sm shadow-blue-950/15">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <div ref={menuRef} className="relative hidden sm:block">
                <button 
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className={`${ICON_BUTTON_CLASS} flex items-center gap-2`}
                >
                  <FiUser className="text-xl" />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <p className="font-bold text-md truncate">{user.email}</p>
                        <p className="text-sm text-slate-500 capitalize mt-0.5">
                          {user.role?.toLowerCase() === 'admin'
                            ? t('roles.admin', { ns: 'common' })
                            : t('roles.customer', { ns: 'common' })}
                        </p>
                      </div>
                      <div className="p-2">
                        {user.role?.toLowerCase() === 'admin' ? (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className={USER_MENU_LINK_CLASS}>
                            <FiSettings className="text-lg" /> {t('header.adminPanel', { ns: 'layout' })}
                          </Link>
                        ) : (
                          <>
                            <Link to="/user/profile" onClick={() => setIsUserMenuOpen(false)} className={USER_MENU_LINK_CLASS}>
                              <FiUser className="text-lg" /> {t('header.myAccount', { ns: 'layout' })}
                            </Link>
                            <Link to="/user/orders" onClick={() => setIsUserMenuOpen(false)} className={USER_MENU_LINK_CLASS}>
                              <FiBox className="text-lg" /> {t('header.orders', { ns: 'layout' })}
                            </Link>
                          </>
                        )}
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                        <button 
                          onClick={() => {
                            onLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-md font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiLogOut className="text-lg" /> {t('header.logout', { ns: 'layout' })}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className={`${ICON_BUTTON_CLASS} hidden sm:block`}>
                <FiUser className="text-xl" />
              </Link>
            )}

            <button 
              className={`sm:hidden ${ICON_BUTTON_CLASS}`}
              onClick={onMenuToggle}
            >
              <FiMenu className="text-xl" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 h-12 text-15 font-semibold text-body-soft">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative h-full flex items-center transition-colors hover:text-blue-700 dark:hover:text-blue-300 ${
                  isActive ? 'text-blue-700 dark:text-blue-300' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {t(item.labelKey, { ns: 'layout' })}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-md bg-blue-600 dark:bg-blue-300"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
