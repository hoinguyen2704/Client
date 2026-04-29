import axios from '../axios';
import type {
  AddToCartRequest,
  ApiResponse,
  CartResponse,
  UpdateCartItemQuantityRequest,
} from '@/types';

const CART_URL = '/cart';

const cartService = {
  getMyCart: (): Promise<ApiResponse<CartResponse[]>> =>
    axios.get(CART_URL),

  addToCart: (data: AddToCartRequest): Promise<ApiResponse<CartResponse>> =>
    axios.post(CART_URL, data),

  updateQuantity: (variantSku: string, quantity: number): Promise<ApiResponse<CartResponse>> => {
    const data: UpdateCartItemQuantityRequest = { quantity };
    return axios.put(`${CART_URL}/items/${variantSku}`, data);
  },

  removeItem: (variantSku: string): Promise<ApiResponse<void>> =>
    axios.delete(`${CART_URL}/items/${variantSku}`),

  clearCart: (): Promise<ApiResponse<void>> =>
    axios.delete(CART_URL),

  getCount: (): Promise<ApiResponse<number>> =>
    axios.get(`${CART_URL}/count`),
};

export default cartService;
