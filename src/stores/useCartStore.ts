import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import cartService from '@/apis/services/cartService';

interface CartState {
  totalItems: number;

  /** Sync the totalItems count from the server's /cart/count endpoint */
  syncFromServer: () => Promise<void>;

  /** Directly set the totalItems count (e.g., after local add) */
  setTotalItems: (n: number) => void;

  /** Increment totalItems by n (optimistic update before server sync) */
  incrementItems: (n: number) => void;

  /** Clear count to 0 */
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      totalItems: 0,

      syncFromServer: async () => {
        try {
          const res = await cartService.getCount();
          const count = typeof res.data === 'number' ? res.data : 0;
          set({ totalItems: count });
        } catch {
          // user not logged in or network error — leave current count
        }
      },

      setTotalItems: (n) => set({ totalItems: n }),

      incrementItems: (n) => set((s) => ({ totalItems: s.totalItems + n })),

      clearCart: () => set({ totalItems: 0 }),
    }),
    { name: 'cart' },
  ),
);

export default useCartStore;

