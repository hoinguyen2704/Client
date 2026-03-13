import BaseService from './baseService';
import axios from '../axios';
import type { ApiResponse, CategoryResponse, CategoryRequest } from '@/types';

class CategoryService extends BaseService<CategoryResponse, CategoryRequest> {
  constructor() {
    super('/categories');
  }

  async getTree(): Promise<ApiResponse<CategoryResponse[]>> {
    return axios.get(`${this.endpoint}/tree`);
  }

  async getBySlug(slug: string): Promise<ApiResponse<CategoryResponse>> {
    return axios.get(`${this.endpoint}/${slug}`);
  }
}

export default new CategoryService();
