import axios from '../axios';
import type { ApiResponse, PageResponse, WishlistResponse } from '@/types';

const WISHLIST_URL = '/wishlists';

const wishlistService = {
  getMyWishlist: (page = 1, size = 10): Promise<ApiResponse<PageResponse<WishlistResponse>>> =>
    axios.get(WISHLIST_URL, { params: { page, size } }),

  add: (productId: string): Promise<ApiResponse<void>> =>
    axios.post(`${WISHLIST_URL}/${productId}`),

  remove: (productId: string): Promise<ApiResponse<void>> =>
    axios.delete(`${WISHLIST_URL}/${productId}`),
};

export default wishlistService;
