import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import wishlistService from '@/apis/services/wishlistService';
import type { WishlistResponse } from '@/types';
import { toast } from 'sonner';

function getPersistedAuthToken() {
  const raw = localStorage.getItem('auth') || sessionStorage.getItem('auth');
  return raw ? JSON.parse(raw)?.state?.token : null;
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
        try {
          if (!getPersistedAuthToken()) {
            set({ items: [], totalItems: 0 }); // reset if guest
            return;
          }
          
          set({ loading: true });
          const res = await wishlistService.getMyWishlist(1, 100);
          const newItems = res.data?.data || [];
          set({ 
            items: newItems, 
            totalItems: newItems.length,
            loading: false 
          });
        } catch {
          set({ loading: false });
        }
      },

      toggleItem: async (productId: string) => {
        const { items } = get();
        const exists = items.find(i => i.productId === productId);
        
        // Optimistic UI update
        if (!getPersistedAuthToken()) {
          toast.error('Vui lòng đăng nhập để thêm vào mục yêu thích');
          return false;
        }

        try {
          if (exists) {
            // Remove
            set({ 
              items: items.filter(i => i.productId !== productId),
              totalItems: items.length - 1
            });
            await wishlistService.remove(productId);
            toast.success('Đã xoá khỏi danh sách yêu thích');
            return false;
          } else {
            // Add - optimistically incrementing items requires reloading server state
            // to get the correct WishlistResponse object properties (slug, image, etc)
            await wishlistService.add(productId);
            await get().syncFromServer(); // Fetch latest from server to populate full data
            toast.success('Đã thêm vào danh sách yêu thích');
            return true;
          }
        } catch {
          toast.error('Thao tác thất bại, vui lòng thử lại');
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
