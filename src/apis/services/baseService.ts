import axios from '../axios';
import type { ApiResponse, PageResponse, PaginationParams } from '@/types';

/**
 * Generic CRUD service — kế thừa và gán endpoint cho từng entity.
 * Giống pattern baseService.js của HAVU nhưng dùng TS generics.
 */
class BaseService<T, C = Partial<T>> {
  constructor(public endpoint: string) {}

  async getAll(params?: PaginationParams): Promise<ApiResponse<PageResponse<T>>> {
    return axios.get(this.endpoint, { params });
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    return axios.get(`${this.endpoint}/${id}`);
  }

  async create(data: C): Promise<ApiResponse<T>> {
    return axios.post(this.endpoint, data);
  }

  async update(id: string, data: Partial<C>): Promise<ApiResponse<T>> {
    return axios.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return axios.delete(`${this.endpoint}/${id}`);
  }
}

export default BaseService;
