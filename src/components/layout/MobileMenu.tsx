import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiSettings, FiBox, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { navItems } from './Header';
import type { MobileMenuProps } from './types';

export default function MobileMenu({ isOpen, user, onClose, onLogout }: MobileMenuProps) {
  const navigate = useNavigate();

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
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                onKeyDown={handleSearch}
                className="w-full h-10 pl-4 pr-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              
              {/* Mobile User Actions */}
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="font-bold text-sm truncate">{user.email}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{user.role}</p>
                  </div>
                  {user.role === 'admin' ? (
                    <Link to="/admin" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <FiSettings className="text-lg" /> Quản trị viên
                    </Link>
                  ) : (
                    <>
                      <Link to="/user/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <FiUser className="text-lg" /> Tài khoản của tôi
                      </Link>
                      <Link to="/user/orders" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <FiBox className="text-lg" /> Đơn mua
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
                    <FiLogOut className="text-lg" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
                >
                  <FiUser className="text-lg" /> Đăng nhập / Đăng ký
                </Link>
              )}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
