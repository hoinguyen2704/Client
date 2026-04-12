export interface ShopInfo {
  shopName: string;
  shopEmail: string;
  supportEmail: string;
  hotline: string;
  address: string;
  currency: string;
}

export interface ShopState {
  shop: ShopInfo;
  loaded: boolean;
  fetchShopInfo: () => Promise<void>;
}
