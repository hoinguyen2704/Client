import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import Chatbot from '../ui/Chatbot';
import useAuthStore from '@/stores/useAuthStore';
import useUIStore from '@/stores/useUIStore';
import { useScrollToTop } from '@/hooks';

export default function MainLayout() {
  useScrollToTop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  // Sync dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Header
        user={user ? { role: user.role?.toLowerCase() || '', email: user.email } : null}
        theme={darkMode ? 'dark' : 'light'}
        toggleTheme={toggleDarkMode}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onLogout={handleLogout}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        user={user ? { role: user.role?.toLowerCase() || '', email: user.email } : null}
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
