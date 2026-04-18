import { adminAxios } from '../axios';
import type {
  ApiResponse,
  PageResponse,
  FlashSaleResponse,
  FlashSaleRequest,
  FlashSaleStatus,
} from '@/types';

const URL = '/flash-sales';

const adminFlashSaleService = {
  getAll: (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<FlashSaleResponse>>> =>
    adminAxios.get(URL, { params }),

  getById: (id: string): Promise<ApiResponse<FlashSaleResponse>> =>
    adminAxios.get(`${URL}/${id}`),

  create: (data: FlashSaleRequest): Promise<ApiResponse<FlashSaleResponse>> =>
    adminAxios.post(URL, data),

  update: (id: string, data: FlashSaleRequest): Promise<ApiResponse<FlashSaleResponse>> =>
    adminAxios.put(`${URL}/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/${id}`),

  updateStatus: (id: string, status: FlashSaleStatus): Promise<ApiResponse<FlashSaleResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`, null, { params: { status } }),
};

export default adminFlashSaleService;
