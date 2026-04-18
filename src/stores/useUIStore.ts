import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/locales/config';

interface UIState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  language: SupportedLanguage;

  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  setLanguage: (lang: SupportedLanguage) => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      language: DEFAULT_LANGUAGE,

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
