import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

interface UIState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  language: 'vi' | 'en';

  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  setLanguage: (lang: 'vi' | 'en') => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      language: 'vi',

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          document.documentElement.classList.toggle('dark', next);
          return { darkMode: next };
        }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setMobileMenu: (open) => set({ mobileMenuOpen: open }),
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'ui',
      partialize: (state) => ({ 
        darkMode: state.darkMode, 
        sidebarCollapsed: state.sidebarCollapsed,
        language: state.language 
      }),
    },
  ),
);

export default useUIStore;
