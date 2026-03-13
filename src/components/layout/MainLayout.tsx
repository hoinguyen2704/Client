import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiLogOut, FiSettings, FiBox, FiSun, FiMoon } from 'react-icons/fi';
import { FaFacebook, FaYoutube, FaTiktok, FaInstagram, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Chatbot from '../Chatbot';
import LogoIcon from '../ui/LogoIcon';

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/products', label: 'Sản phẩm' },
    { path: '/compare', label: 'So sánh' },
    { path: '/flash-sale', label: 'Khuyến mãi' },
    { path: '/contact', label: 'Liên hệ' },
    { path: '/blog', label: 'Blog công nghệ' },
  ];

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Header */}
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
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs flex items-center justify-center rounded-full shadow-md">
                  3
                </span>
              </Link>
              
              {user ? (
                <div className="relative hidden sm:block user-menu-container">
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
                              localStorage.removeItem('user');
                              setUser(null);
                              setIsUserMenuOpen(false);
                              navigate('/');
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
                onClick={() => setIsMenuOpen(!isMenuOpen)}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
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
                    onClick={() => setIsMenuOpen(false)}
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
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <FiSettings className="text-lg" /> Quản trị viên
                      </Link>
                    ) : (
                      <>
                        <Link to="/user/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <FiUser className="text-lg" /> Tài khoản của tôi
                        </Link>
                        <Link to="/user/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <FiBox className="text-lg" /> Đơn mua
                        </Link>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        localStorage.removeItem('user');
                        setUser(null);
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiLogOut className="text-lg" /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
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

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand & Contact */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6338f0] flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                <LogoIcon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-[#2539e6] dark:text-white">
                Hozitech
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Hozitech là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm công nghệ chính hãng, uy tín và chất lượng hàng đầu Việt Nam.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong className="text-slate-800 dark:text-white">Địa chỉ:</strong> 123 Đường Công Nghệ, Quận 1, TP.HCM</p>
              <p><strong className="text-slate-800 dark:text-white">Điện thoại:</strong> 1900 1234 (8:00 - 21:00)</p>
              <p><strong className="text-slate-800 dark:text-white">Email:</strong> support@hozitech.com</p>
            </div>
          </div>

          {/* Col 2: Về chúng tôi */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">Về Hozitech</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Giới thiệu công ty</Link></li>
              <li><Link to="/careers" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/terms" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/contact" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Liên hệ hợp tác</Link></li>
            </ul>
          </div>

          {/* Col 3: Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/support/shopping" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/support/payment" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Hướng dẫn thanh toán</Link></li>
              <li><Link to="/support/shipping" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Chính sách giao hàng</Link></li>
              <li><Link to="/support/warranty" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Chính sách bảo hành</Link></li>
              <li><Link to="/support/returns" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Chính sách đổi trả</Link></li>
            </ul>
          </div>

          {/* Col 4: Kết nối & Thanh toán */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">Kết nối với chúng tôi</h3>
            <div className="flex gap-4 mb-8">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all">
                <FaYoutube className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white transition-all">
                <FaTiktok className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white transition-all">
                <FaInstagram className="text-xl" />
              </a>
            </div>
            
            <h3 className="text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm">Phương thức thanh toán</h3>
            <div className="flex gap-3 text-3xl text-slate-400 dark:text-slate-500">
              <FaCcVisa className="hover:text-blue-600 dark:hover:text-white transition-colors" />
              <FaCcMastercard className="hover:text-orange-500 dark:hover:text-white transition-colors" />
              <FaCcPaypal className="hover:text-blue-500 dark:hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-8 lg:px-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 Hozitech. All rights reserved.</p>
          <p>Thiết kế và phát triển bởi Hozitech Team.</p>
        </div>
      </footer>
      
      <Chatbot />
    </div>
  );
}
