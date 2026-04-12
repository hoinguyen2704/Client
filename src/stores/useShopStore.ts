import { create } from 'zustand';
import settingService from '@/apis/services/settingService';
import { SHOP } from '@/constants/shopConstants';
import type { ShopState } from '@/types';

const useShopStore = create<ShopState>()((set, get) => ({
  shop: {
    shopName: SHOP.name,
    shopEmail: SHOP.email,
    supportEmail: SHOP.supportEmail,
    hotline: SHOP.hotline,
    address: SHOP.address,
    currency: 'VND',
  },
  loaded: false,

  fetchShopInfo: async () => {
    if (get().loaded) return;
    try {
      const res = await settingService.getShop();
      const data = res.data;
      set({
        shop: {
          shopName: data.shopName || SHOP.name,
          shopEmail: data.shopEmail || SHOP.email,
          supportEmail: data.supportEmail || SHOP.supportEmail,
          hotline: data.hotline || SHOP.hotline,
          address: data.address || SHOP.address,
          currency: data.currency || 'VND',
        },
        loaded: true,
      });
    } catch {
      // Giữ nguyên fallback từ shopConstants
      set({ loaded: true });
    }
  },
}));

export default useShopStore;
