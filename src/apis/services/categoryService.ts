import axios from '../axios';
import type { ApiResponse, CategoryResponse } from '@/types';

class CategoryService {
  private readonly endpoint = '/categories';

  async getAllActive(): Promise<ApiResponse<CategoryResponse[]>> {
    return axios.get(this.endpoint);
  }

  async getBySlug(slug: string): Promise<ApiResponse<CategoryResponse>> {
    return axios.get(`${this.endpoint}/${slug}`);
  }

  getById = async (id: string): Promise<ApiResponse<CategoryResponse>> => {
    return axios.get(`${this.endpoint}/id/${id}`);
  };
}

export default new CategoryService();
