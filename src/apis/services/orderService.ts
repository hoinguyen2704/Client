import BaseService from './baseService';
import axios from '../axios';
import type {
  ApiResponse,
  PageResponse,
  OrderResponse,
  CheckoutRequest,
} from '@/types';

class OrderService extends BaseService<OrderResponse> {
  constructor() {
    super('/orders');
  }

  async checkout(data: CheckoutRequest): Promise<ApiResponse<OrderResponse>> {
    return axios.post(`${this.endpoint}/checkout`, data);
  }

  async getByNumber(orderNumber: string): Promise<ApiResponse<OrderResponse>> {
    return axios.get(`${this.endpoint}/${orderNumber}`);
  }

  async getMyOrders(params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<OrderResponse>>> {
    return axios.get(this.endpoint, { params });
  }

  async cancel(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return axios.patch(`${this.endpoint}/${orderId}/cancel`);
  }

  // Admin
  async updateStatus(orderId: string, status: string): Promise<ApiResponse<OrderResponse>> {
    return axios.patch(`/admin/orders/${orderId}/status`, { status });
  }
}

export default new OrderService();
