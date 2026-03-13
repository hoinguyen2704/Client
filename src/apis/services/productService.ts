import BaseService from './baseService';
import axios from '../axios';
import type { ApiResponse, PageResponse, ProductResponse, ProductRequest } from '@/types';

class ProductService extends BaseService<ProductResponse, ProductRequest> {
  constructor() {
    super('/products');
  }

  async search(params: {
    keyword?: string;
    categorySlug?: string;
    brand?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PageResponse<ProductResponse>>> {
    return axios.get(this.endpoint, { params });
  }

  async getBySlug(slug: string): Promise<ApiResponse<ProductResponse>> {
    return axios.get(`${this.endpoint}/${slug}`);
  }
}

export default new ProductService();
