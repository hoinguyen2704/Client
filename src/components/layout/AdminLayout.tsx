import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import RealtimeBridge from '../realtime/RealtimeBridge';
import useAuthStore from '@/stores/useAuthStore';
import useUIStore from '@/stores/useUIStore';
import { preloadNamespaces } from '@/i18n';
import AdminQueryProvider from './AdminQueryProvider';

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const preload = () => {
      void preloadNamespaces([
        'adminDashboard',
        'adminSales',
        'adminCatalog',
        'adminCustomers',
        'adminSupport',
        'adminContent',
        'adminSettings',
        'common',
      ]);
    };

    if (typeof win.requestIdleCallback === 'function') {
      const handle = win.requestIdleCallback(preload);
      return () => {
        if (typeof win.cancelIdleCallback === 'function') {
          win.cancelIdleCallback(handle);
        }
      };
    }

    const timeoutId = window.setTimeout(preload, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <AdminQueryProvider>
      <div className="admin-border-strong min-h-screen flex bg-slate-50 dark:bg-slate-900 text-ink">
        <AdminSidebar />

        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
          <RealtimeBridge />
          <AdminHeader onLogout={logout} />

          <main className="flex-1 min-w-0 overflow-x-auto p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-[1520px] min-w-[1520px] max-w-[1520px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminQueryProvider>
  );
}
