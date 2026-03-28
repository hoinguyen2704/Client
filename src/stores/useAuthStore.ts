import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// Custom storage that checks both localStorage and sessionStorage
const authStorage = {
  getItem: (name: string) => {
    // Check localStorage first, then sessionStorage
    return localStorage.getItem(name) || sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    // Determine where to store based on a flag
    const useSession = sessionStorage.getItem('auth-session-only') === 'true';
    if (useSession) {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    } else {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user, rememberMe = true) => {
        // Set storage mode BEFORE setting state
        if (rememberMe) {
          sessionStorage.removeItem('auth-session-only');
        } else {
          sessionStorage.setItem('auth-session-only', 'true');
        }
        set({ token, user, isAuthenticated: true });
        
        // Sync cart and wishlist from server after successful login
        import('./useCartStore').then(m => m.default.getState().syncFromServer());
        import('./useWishlistStore').then(m => m.default.getState().syncFromServer());
      },

      logout: () => {
        sessionStorage.removeItem('auth-session-only');
        import('./useCartStore').then(m => m.default.getState().clearCart());
        import('./useWishlistStore').then(m => m.default.getState().clearWishlist());
        set({ token: null, user: null, isAuthenticated: false });
        window.location.href = '/login';
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => authStorage),
    },
  ),
);

export default useAuthStore;
