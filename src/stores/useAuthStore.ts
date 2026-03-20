import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        window.location.href = '/login';
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'auth' },
  ),
);

export default useAuthStore;
