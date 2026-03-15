import axios from '../axios';
import { adminAxios } from '../axios';
import type {
  ApiResponse,
  PageResponse,
  OrderResponse,
  CheckoutRequest,
} from '@/types';

const ORDER_URL = '/orders';

const orderService = {
  // ─── User endpoints (api/v1/orders) ─────────────────────────────
  checkout: (data: CheckoutRequest): Promise<ApiResponse<OrderResponse>> =>
    axios.post(`${ORDER_URL}/checkout`, data),

  getByNumber: (orderNumber: string): Promise<ApiResponse<OrderResponse>> =>
    axios.get(`${ORDER_URL}/${orderNumber}`),

  getMyOrders: (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<OrderResponse>>> =>
    axios.get(ORDER_URL, { params }),

  cancel: (orderId: string): Promise<ApiResponse<OrderResponse>> =>
    axios.patch(`${ORDER_URL}/${orderId}/cancel`),

  // ─── Admin endpoints (admin/api/v1/orders) ──────────────────────
  updateStatus: (orderId: string, status: string): Promise<ApiResponse<OrderResponse>> =>
    adminAxios.patch(`${ORDER_URL}/${orderId}/status`, { status }),
};

export default orderService;
