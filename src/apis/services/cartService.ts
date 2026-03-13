import axios from '../axios';
import type { ApiResponse, CartResponse } from '@/types';

const CART_URL = '/cart';

const cartService = {
  getMyCart: (): Promise<ApiResponse<CartResponse[]>> =>
    axios.get(CART_URL),

  addToCart: (data: { variantId: string; quantity: number }): Promise<ApiResponse<CartResponse>> =>
    axios.post(CART_URL, data),

  updateQuantity: (itemId: string, quantity: number): Promise<ApiResponse<CartResponse>> =>
    axios.put(`${CART_URL}/${itemId}`, { quantity }),

  removeItem: (itemId: string): Promise<ApiResponse<void>> =>
    axios.delete(`${CART_URL}/${itemId}`),

  clearCart: (): Promise<ApiResponse<void>> =>
    axios.delete(CART_URL),

  getCount: (): Promise<ApiResponse<number>> =>
    axios.get(`${CART_URL}/count`),
};

export default cartService;
