import { NavLink, Link } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiRotateCcw, FiBox, FiList, FiUsers, FiTag, FiSettings, FiMessageSquare, FiCpu, FiFileText, FiHeadphones, FiChevronLeft, FiZap, FiAward } from 'react-icons/fi';
import LogoIcon from '../ui/LogoIcon';
import useUIStore from '@/stores/useUIStore';
import { SHOP } from '@/constants/shopConstants';
import { cn } from '@/utils/cn';

const menuItems = [
  { path: '/admin/dashboard', icon: FiGrid, label: 'Tổng quan' },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
  { path: '/admin/returns', icon: FiRotateCcw, label: 'Trả hàng / Hoàn tiền' },
  { path: '/admin/products', icon: FiBox, label: 'Sản phẩm & Kho' },
  { path: '/admin/categories', icon: FiList, label: 'Danh mục' },
  { path: '/admin/brands', icon: FiAward, label: 'Thương hiệu' },
  { path: '/admin/customers', icon: FiUsers, label: 'Khách hàng' },
  { path: '/admin/vouchers', icon: FiTag, label: 'Voucher' },
  { path: '/admin/flash-sales', icon: FiZap, label: 'Flash Sale' },
  { path: '/admin/feedbacks', icon: FiMessageSquare, label: 'Đánh giá' },
  { path: '/admin/tickets', icon: FiHeadphones, label: 'Hỗ trợ (Tickets)' },
  { path: '/admin/chatbot', icon: FiCpu, label: 'AI Chatbot' },
  { path: '/admin/cms', icon: FiFileText, label: 'Nội dung (CMS)' },
  { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' },
];

export default function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/45 z-30"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 z-40 transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-72 max-lg:w-[280px] max-lg:max-w-[82vw]',
          // Mobile: hidden when collapsed
          sidebarCollapsed ? 'max-lg:-translate-x-full' : 'max-lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="h-16 sm:h-20 flex items-center px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 justify-between">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
            <LogoIcon />
            {!sidebarCollapsed && (
              <span className="text-base sm:text-xl font-bold text-[#2539e6] whitespace-nowrap">{SHOP.name} Admin</span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hidden lg:flex"
            title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            <FiChevronLeft className={cn('text-lg transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 sm:py-6 px-2.5 sm:px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all font-medium text-md sm:text-base',
                  sidebarCollapsed && 'justify-center px-3',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="text-base sm:text-lg shrink-0" />
                {!sidebarCollapsed && item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
