import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import Chatbot from '../ui/Chatbot';

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();

  // ── Theme ────────────────────────────────────────────────────
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

  // ── User ─────────────────────────────────────────────────────
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <Header
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onLogout={handleLogout}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        user={user}
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
