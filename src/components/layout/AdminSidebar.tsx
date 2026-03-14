import { NavLink, Link } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiBox, FiList, FiUsers, FiTag, FiSettings, FiMessageSquare, FiCpu, FiFileText, FiHeadphones } from 'react-icons/fi';
import LogoIcon from '../ui/LogoIcon';
import { cn } from '@/utils/cn';

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

export default function AdminSidebar() {
  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 z-20">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6338f0] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
            <LogoIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-[#2539e6]">Hozitech Admin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )}>
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
