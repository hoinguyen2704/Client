import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, OrderResponse } from '@/types';

const URL = '/orders';

const adminOrderService = {
  getAll: (params?: {
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<OrderResponse>>> =>
    adminAxios.get(URL, { params }),

  updateStatus: (id: string, status: string): Promise<ApiResponse<OrderResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`, { status }),

  export: (params?: {
    status?: string;
    keyword?: string;
    from?: string;
    to?: string;
  }): Promise<Blob> =>
    adminAxios.get(`${URL}/export`, { params, responseType: 'blob' }),
};

export default adminOrderService;
