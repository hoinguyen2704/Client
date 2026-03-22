import BaseService from './baseService';
import axios from '../axios';
import type { ApiResponse, BrandResponse, BrandRequest } from '@/types';

class BrandService extends BaseService<BrandResponse, BrandRequest> {
  constructor() {
    super('/brands');
  }

  async getBySlug(slug: string): Promise<ApiResponse<BrandResponse>> {
    return axios.get(`${this.endpoint}/${slug}`);
  }

  async getById(id: string): Promise<ApiResponse<BrandResponse>> {
    return axios.get(`${this.endpoint}/id/${id}`);
  }
}

export default new BrandService();
