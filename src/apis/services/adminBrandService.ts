import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, BrandResponse, BrandRequest } from '@/types';

const URL = '/brands';

const adminBrandService = {
  getAll: (params?: {
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<BrandResponse>>> =>
    adminAxios.get(URL, { params }),

  create: (data: BrandRequest): Promise<ApiResponse<BrandResponse>> =>
    adminAxios.post(URL, data),

  update: (id: string, data: BrandRequest): Promise<ApiResponse<BrandResponse>> =>
    adminAxios.put(`${URL}/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/${id}`),
};

export default adminBrandService;
