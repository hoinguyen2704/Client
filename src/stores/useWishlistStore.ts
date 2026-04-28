import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import wishlistService from '@/apis/services/wishlistService';
import i18n from '@/i18n';
import type { WishlistResponse } from '@/types';
import { toast } from 'sonner';

let wishlistSyncPromise: Promise<void> | null = null;

function getPersistedAuthToken() {
  const raw = localStorage.getItem('auth') || sessionStorage.getItem('auth');
  return raw ? JSON.parse(raw)?.state?.token : null;
}

function translateWishlistToast(key: string, defaultValue: string) {
  return i18n.t(key, { ns: 'common', defaultValue });
}

interface WishlistStore {
  items: WishlistResponse[];
  loading: boolean;
  totalItems: number;
  syncFromServer: () => Promise<void>;
  toggleItem: (productId: string) => Promise<boolean>;
  clearWishlist: () => void;
}

const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      totalItems: 0,

      syncFromServer: async () => {
        if (!getPersistedAuthToken()) {
          set({ items: [], totalItems: 0, loading: false });
          return;
        }

        if (wishlistSyncPromise) {
          return wishlistSyncPromise;
        }

        wishlistSyncPromise = (async () => {
          set({ loading: true });
          try {
            const res = await wishlistService.getMyWishlist(1, 100);
            const newItems = res.data?.data || [];
            set({
              items: newItems,
              totalItems: newItems.length,
            });
          } catch {
            // Keep the current optimistic/persisted state if refresh fails.
          } finally {
            set({ loading: false });
            wishlistSyncPromise = null;
          }
        })();

        return wishlistSyncPromise;
      },

      toggleItem: async (productId: string) => {
        const { items } = get();
        const exists = items.find(i => i.productId === productId);
        
        // Optimistic UI update
        if (!getPersistedAuthToken()) {
          toast.error(
            translateWishlistToast(
              'wishlist.toasts.loginRequired',
              'Please log in to add this item to your wishlist.',
            ),
          );
          return false;
        }

        try {
          if (exists) {
            // Remove
            set((state) => ({
              items: state.items.filter(i => i.productId !== productId),
              totalItems: Math.max(state.totalItems - 1, 0),
            }));
            await wishlistService.remove(productId);
            toast.success(
              translateWishlistToast(
                'wishlist.toasts.removed',
                'Removed from wishlist.',
              ),
            );
            return false;
          } else {
            // Add - optimistically incrementing items requires reloading server state
            // to get the correct WishlistResponse object properties (slug, image, etc)
            await wishlistService.add(productId);
            await get().syncFromServer(); // Fetch latest from server to populate full data
            toast.success(
              translateWishlistToast(
                'wishlist.toasts.added',
                'Added to wishlist.',
              ),
            );
            return true;
          }
        } catch {
          toast.error(
            translateWishlistToast(
              'wishlist.toasts.failed',
              'Action failed. Please try again.',
            ),
          );
          // Rollback by doing a sync
          await get().syncFromServer();
          return !!exists;
        }
      },

      clearWishlist: () => {
        set({ items: [], totalItems: 0, loading: false });
      }
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWishlistStore;
