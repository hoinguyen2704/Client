import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import RealtimeBridge from '../realtime/RealtimeBridge';
import useAuthStore from '@/stores/useAuthStore';
import useUIStore from '@/stores/useUIStore';

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="admin-border-strong min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <AdminSidebar />

      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <RealtimeBridge />
        <AdminHeader onLogout={logout} />

        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-clip">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
