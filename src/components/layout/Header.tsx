import { useState, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiLogOut, FiSettings, FiBox, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import LogoIcon from '../ui/LogoIcon';
import useCartStore from '@/stores/useCartStore';
import { useClickOutside } from '@/hooks';
import type { HeaderProps } from './types';

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/products', label: 'Sản phẩm' },
  { path: '/compare', label: 'So sánh' },
  { path: '/flash-sale', label: 'Khuyến mãi' },
  { path: '/contact', label: 'Liên hệ' },
  { path: '/blog', label: 'Blog công nghệ' },
];

export { navItems };

export default function Header({ user, theme, toggleTheme, onMenuToggle, onLogout }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { totalItems } = useCartStore();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, useCallback(() => setIsUserMenuOpen(false), []));

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
            <div className="w-10 h-10 rounded-2xl bg-[#6338f0] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
              <LogoIcon className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-[#2539e6] hidden sm:block">
              Hozitech
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:flex relative group">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm công nghệ..."
              onKeyDown={handleSearch}
              className="w-full h-12 pl-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-purple-500 transition-colors" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl" />}
            </button>
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <FiSearch className="text-xl" />
            </button>
            <Link to="/wishlist" className="p-2 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-colors relative">
              <FiHeart className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link to="/cart" className="p-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors relative">
              <FiShoppingCart className="text-xl" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs flex items-center justify-center rounded-full shadow-md">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <div ref={menuRef} className="relative hidden sm:block">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FiUser className="text-xl" />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <p className="font-bold text-sm truncate">{user.email}</p>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{user.role}</p>
                      </div>
                      <div className="p-2">
                        {user.role === 'admin' ? (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <FiSettings className="text-lg" /> Quản trị viên
                          </Link>
                        ) : (
                          <>
                            <Link to="/user/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                              <FiUser className="text-lg" /> Tài khoản của tôi
                            </Link>
                            <Link to="/user/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                              <FiBox className="text-lg" /> Đơn mua
                            </Link>
                          </>
                        )}
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                        <button 
                          onClick={() => {
                            onLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiLogOut className="text-lg" /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:block">
                <FiUser className="text-xl" />
              </Link>
            )}

            <button 
              className="sm:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              onClick={onMenuToggle}
            >
              <FiMenu className="text-xl" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 h-12 text-[15px] font-semibold text-slate-600 dark:text-slate-300">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative h-full flex items-center transition-colors hover:text-[#2539e6] dark:hover:text-blue-400 ${
                  isActive ? 'text-[#2539e6] dark:text-blue-400' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2539e6] dark:bg-blue-400 rounded-t-md"></span>
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
