import BaseService from './baseService';
import { adminAxios } from '../axios';
import type {
  ApiResponse,
  ProductResponse,
  ProductRequest,
} from '@/types';

class AdminProductService extends BaseService<ProductResponse, ProductRequest> {
  constructor() {
    super('/products', adminAxios);
  }

  async toggleStatus(id: string): Promise<ApiResponse<ProductResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  }

  async uploadImages(productId: string, files: File[]): Promise<ApiResponse<{id: string; imageUrl: string}[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.endpoint}/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async deleteImage(productId: string, imageId: string): Promise<ApiResponse<void>> {
    return this.http.delete(`${this.endpoint}/${productId}/images/${imageId}`);
  }

  async uploadVariantImages(productId: string, variantId: string, files: File[]): Promise<ApiResponse<{id: string; imageUrl: string}[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.endpoint}/${productId}/variants/${variantId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async deleteVariantImage(productId: string, variantId: string, imageId: string): Promise<ApiResponse<void>> {
    return this.http.delete(`${this.endpoint}/${productId}/variants/${variantId}/images/${imageId}`);
  }

  /** Xuất danh sách sản phẩm ra Excel */
  async export(params?: {
    keyword?: string;
    categoryId?: string;
    status?: string;
  }): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }
}

export default new AdminProductService();
