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
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (token: string, refreshToken: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  setTokens: (token: string, refreshToken: string) => void;
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
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: (token, refreshToken, user, rememberMe = true) => {
        // Set storage mode BEFORE setting state
        if (rememberMe) {
          sessionStorage.removeItem('auth-session-only');
        } else {
          sessionStorage.setItem('auth-session-only', 'true');
        }
        set({ token, refreshToken, user, isAuthenticated: true });
        
        // Sync cart and wishlist from server after successful login
        // Use lazy require-style to avoid circular import at module level
        Promise.resolve().then(async () => {
          const { default: useCartStore } = await import('./useCartStore');
          const { default: useWishlistStore } = await import('./useWishlistStore');
          useCartStore.getState().syncFromServer();
          useWishlistStore.getState().syncFromServer();
        });
      },

      logout: () => {
        sessionStorage.removeItem('auth-session-only');
        // Clear cart and wishlist stores
        Promise.resolve().then(async () => {
          const { default: useCartStore } = await import('./useCartStore');
          const { default: useWishlistStore } = await import('./useWishlistStore');
          useCartStore.getState().clearCart();
          useWishlistStore.getState().clearWishlist();
        });
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
        window.location.href = '/login';
      },
      
      setTokens: (token, refreshToken) => set({ token, refreshToken }),

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
