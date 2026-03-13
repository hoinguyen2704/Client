import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiBox, FiList, FiUsers, FiTag, FiSettings, FiBell, FiSearch, FiLogOut, FiMessageSquare, FiCpu, FiFileText, FiHeadphones } from 'react-icons/fi';
import LogoIcon from '../ui/LogoIcon';
import { cn } from '../../utils/cn';

const menuItems = [
  { path: '/admin/dashboard', icon: FiGrid, label: 'Tổng quan' },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
  { path: '/admin/products', icon: FiBox, label: 'Sản phẩm & Kho' },
  { path: '/admin/categories', icon: FiList, label: 'Danh mục' },
  { path: '/admin/customers', icon: FiUsers, label: 'Khách hàng' },
  { path: '/admin/promotions', icon: FiTag, label: 'Khuyến mãi' },
  { path: '/admin/vouchers', icon: FiTag, label: 'Voucher' },
  { path: '/admin/feedbacks', icon: FiMessageSquare, label: 'Đánh giá' },
  { path: '/admin/tickets', icon: FiHeadphones, label: 'Hỗ trợ (Tickets)' },
  { path: '/admin/chatbot', icon: FiCpu, label: 'AI Chatbot' },
  { path: '/admin/cms', icon: FiFileText, label: 'Nội dung (CMS)' },
  { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload(); // Force reload to update MainLayout state
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6338f0] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
              <LogoIcon className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-[#2539e6]">
              Hozitech Admin
            </span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <item.icon className="text-lg" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pl-72">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block group">
              <input
                type="text"
                placeholder="Tìm kiếm trong admin..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-purple-500 transition-colors" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative">
              <FiBell className="text-xl" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button onClick={handleLogout} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
              <div className="hidden md:block text-sm text-left">
                <p className="font-bold">Admin Manager</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Super Admin</p>
              </div>
              <FiLogOut className="text-slate-400 ml-2" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
