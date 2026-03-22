import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, FlashSaleResponse } from '@/types';

const URL = '/flash-sales';

export interface FlashSaleRequest {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  items?: FlashSaleItemRequest[];
}

export interface FlashSaleItemRequest {
  variantId: string;
  flashPrice: number;
  flashStock: number;
}

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
};

export default adminFlashSaleService;
