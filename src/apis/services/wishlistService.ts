import axios from '../axios';
import type { ApiResponse, PageResponse, WishlistResponse } from '@/types';

const WISHLIST_URL = '/wishlists';

const wishlistService = {
  getMyWishlist: (page = 1, size = 10): Promise<ApiResponse<PageResponse<WishlistResponse>>> =>
    axios.get(WISHLIST_URL, { params: { page, size } }),

  add: (productSlug: string): Promise<ApiResponse<void>> =>
    axios.post(`${WISHLIST_URL}/${productSlug}`),

  remove: (productSlug: string): Promise<ApiResponse<void>> =>
    axios.delete(`${WISHLIST_URL}/${productSlug}`),

  checkProduct: (productSlug: string): Promise<ApiResponse<boolean>> =>
    axios.get(`${WISHLIST_URL}/check/${productSlug}`),

  getCount: (): Promise<ApiResponse<number>> =>
    axios.get(`${WISHLIST_URL}/count`),
};

export default wishlistService;
