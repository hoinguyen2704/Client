import { Outlet } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import Chatbot from '../chat/Chatbot';
import SupportChatWidget from '../chat/SupportChatWidget';
import RealtimeBridge from '../realtime/RealtimeBridge';
import useAuthStore from '@/stores/useAuthStore';
import useUIStore from '@/stores/useUIStore';
import { useScrollToTop } from '@/hooks';

export default function MainLayout() {
  useScrollToTop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);

  // Sync dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const normalizedUser = useMemo(
    () => (user ? { role: user.role?.toLowerCase() || '', email: user.email } : null),
    [user],
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-ink-max transition-colors duration-300">
      <Header
        user={normalizedUser}
        theme={darkMode ? 'dark' : 'light'}
        toggleTheme={toggleDarkMode}
        onMenuToggle={handleMenuToggle}
        onLogout={handleLogout}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        user={normalizedUser}
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <RealtimeBridge />
      {user?.role !== 'ADMIN' && <SupportChatWidget />}
      <Chatbot />
    </div>
  );
}
