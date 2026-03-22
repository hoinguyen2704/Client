import { adminAxios } from '../axios';
import type {
  ApiResponse,
  PageResponse,
  ProductResponse,
  ProductRequest,
} from '@/types';

const URL = '/products';

const adminProductService = {
  getAll: (params?: {
    keyword?: string;
    categoryId?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PageResponse<ProductResponse>>> =>
    adminAxios.get(URL, { params }),

  getById: (id: string): Promise<ApiResponse<ProductResponse>> =>
    adminAxios.get(`${URL}/${id}`),

  create: (data: ProductRequest): Promise<ApiResponse<ProductResponse>> =>
    adminAxios.post(URL, data),

  update: (id: string, data: ProductRequest): Promise<ApiResponse<ProductResponse>> =>
    adminAxios.put(`${URL}/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/${id}`),

  toggleStatus: (id: string): Promise<ApiResponse<ProductResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`),

  uploadImages: (productId: string, files: File[]): Promise<ApiResponse<{id: string; imageUrl: string}[]>> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return adminAxios.post(`${URL}/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (productId: string, imageId: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/${productId}/images/${imageId}`),
};

export default adminProductService;
