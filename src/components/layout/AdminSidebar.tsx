import { NavLink, Link } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiRotateCcw, FiBox, FiList, FiUsers, FiTag, FiSettings, FiMessageSquare, FiCpu, FiFileText, FiHeadphones, FiChevronLeft, FiZap, FiAward, FiBell } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../ui/LogoIcon';
import useUIStore from '@/stores/useUIStore';
import useNotificationStore from '@/stores/useNotificationStore';
import { SHOP } from '@/constants/shopConstants';
import { cn } from '@/utils/cn';

const SIDEBAR_COLLAPSE_BUTTON_CLASS =
  'p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-subtle hover:text-body transition-colors hidden lg:flex';
const SIDEBAR_IDLE_ITEM_CLASS =
  'text-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-ink';

const menuItems = [
  { path: '/admin/dashboard', icon: FiGrid, labelKey: 'adminSidebar.dashboard' },
  { path: '/admin/orders', icon: FiShoppingBag, labelKey: 'adminSidebar.orders' },
  { path: '/admin/returns', icon: FiRotateCcw, labelKey: 'adminSidebar.returns' },
  { path: '/admin/products', icon: FiBox, labelKey: 'adminSidebar.products' },
  { path: '/admin/categories', icon: FiList, labelKey: 'adminSidebar.categories' },
  { path: '/admin/brands', icon: FiAward, labelKey: 'adminSidebar.brands' },
  { path: '/admin/customers', icon: FiUsers, labelKey: 'adminSidebar.customers' },
  { path: '/admin/vouchers', icon: FiTag, labelKey: 'adminSidebar.vouchers' },
  { path: '/admin/flash-sales', icon: FiZap, labelKey: 'adminSidebar.flashSale' },
  { path: '/admin/notifications', icon: FiBell, labelKey: 'adminSidebar.notifications' },
  { path: '/admin/feedbacks', icon: FiMessageSquare, labelKey: 'adminSidebar.feedbacks' },
  { path: '/admin/tickets', icon: FiHeadphones, labelKey: 'adminSidebar.tickets' },
  { path: '/admin/chatbot', icon: FiCpu, labelKey: 'adminSidebar.chatbot' },
  { path: '/admin/cms', icon: FiFileText, labelKey: 'adminSidebar.content' },
  { path: '/admin/settings', icon: FiSettings, labelKey: 'adminSidebar.settings' },
];

export default function AdminSidebar() {
  const { t } = useTranslation(['layout', 'common']);
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

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
              <span className="whitespace-nowrap text-base font-bold tracking-tight text-blue-700 dark:text-blue-300 sm:text-xl">{SHOP.name} Admin</span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className={SIDEBAR_COLLAPSE_BUTTON_CLASS}
            title={sidebarCollapsed
              ? t('actions.expand', { ns: 'common' })
              : t('actions.collapse', { ns: 'common' })}
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
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/15'
                    : SIDEBAR_IDLE_ITEM_CLASS
                )}
                title={sidebarCollapsed ? t(item.labelKey, { ns: 'layout' }) : undefined}
              >
                {({ isActive }) => {
                  const showUnread = item.path === '/admin/notifications' && unreadCount > 0;

                  return (
                    <>
                      <span className="relative flex items-center justify-center shrink-0">
                        <item.icon className="text-base sm:text-lg shrink-0" />
                        {sidebarCollapsed && showUnread && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white dark:border-slate-900" />
                        )}
                      </span>
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1">{t(item.labelKey, { ns: 'layout' })}</span>
                          {showUnread && (
                            <span className={cn(
                              'min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-10 font-bold',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
                            )}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
