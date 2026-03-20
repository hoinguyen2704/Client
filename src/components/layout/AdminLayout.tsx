import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import useAuthStore from '@/stores/useAuthStore';
import useUIStore from '@/stores/useUIStore';

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <AdminSidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <AdminHeader onLogout={logout} />

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
