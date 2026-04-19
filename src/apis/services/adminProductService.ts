import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { AxiosRequestConfig } from 'axios';
import type {
  AdminProductListItem,
  AdminProductPickerItem,
  AdminProductVariantSummary,
  ApiResponse,
  PageResponse,
  ProductBasicRequest,
  ProductResponse,
  ProductRequest,
  ProductVariantsUpdateRequest,
} from '@/types';

class AdminProductService extends BaseService<ProductResponse, ProductRequest> {
  constructor() {
    super('/products', adminAxios);
  }

  async getList(
    params?: {
      keyword?: string;
      categoryId?: string;
      status?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'ASC' | 'DESC';
    },
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<PageResponse<AdminProductListItem>>> {
    return this.http.get(this.endpoint, { ...(config || {}), params });
  }

  async getPickerList(
    params?: {
      keyword?: string;
      categoryId?: string;
      brandId?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'ASC' | 'DESC';
    },
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<PageResponse<AdminProductPickerItem>>> {
    return this.http.get(`${this.endpoint}/picker`, { ...(config || {}), params });
  }

  async getVariantSummaries(productId: string, config?: AxiosRequestConfig): Promise<ApiResponse<AdminProductVariantSummary[]>> {
    return this.http.get(`${this.endpoint}/${productId}/variants/summary`, config);
  }

  async toggleStatus(id: string): Promise<ApiResponse<ProductResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  }

  async createBasic(data: ProductBasicRequest): Promise<ApiResponse<ProductResponse>> {
    return this.http.post(this.endpoint, data);
  }

  async updateBasic(id: string, data: ProductBasicRequest): Promise<ApiResponse<ProductResponse>> {
    return this.http.put(`${this.endpoint}/${id}/basic`, data);
  }

  async updateVariants(id: string, data: ProductVariantsUpdateRequest): Promise<ApiResponse<ProductResponse>> {
    return this.http.put(`${this.endpoint}/${id}/variants`, data);
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
