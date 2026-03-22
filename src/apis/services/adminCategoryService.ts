import { adminAxios } from '../axios';
import type {
  ApiResponse,
  PageResponse,
  CategoryResponse,
  CategoryRequest,
} from '@/types';

const URL = '/categories';

const adminCategoryService = {
  getAll: (params?: {
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<CategoryResponse>>> =>
    adminAxios.get(URL, { params }),

  create: (data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> =>
    adminAxios.post(URL, data),

  update: (id: string, data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> =>
    adminAxios.put(`${URL}/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/${id}`),

  toggleStatus: (id: string): Promise<ApiResponse<CategoryResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`),
};

export default adminCategoryService;
