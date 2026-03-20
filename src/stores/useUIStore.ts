import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarCollapsed: false,
      mobileMenuOpen: false,

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          document.documentElement.classList.toggle('dark', next);
          return { darkMode: next };
        }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setMobileMenu: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'ui',
      partialize: (state) => ({ darkMode: state.darkMode, sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);

export default useUIStore;
