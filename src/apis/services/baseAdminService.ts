import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, PaginationParams } from '@/types';

/**
 * Generic CRUD service cho Admin endpoints (admin/api/v1/...).
 * Dùng adminAxios instance thay vì clientAxios.
 */
class BaseAdminService<T, C = Partial<T>> {
  constructor(public endpoint: string) {}

  async getAll(params?: PaginationParams): Promise<ApiResponse<PageResponse<T>>> {
    return adminAxios.get(this.endpoint, { params });
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    return adminAxios.get(`${this.endpoint}/${id}`);
  }

  async create(data: C): Promise<ApiResponse<T>> {
    return adminAxios.post(this.endpoint, data);
  }

  async update(id: string, data: Partial<C>): Promise<ApiResponse<T>> {
    return adminAxios.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return adminAxios.delete(`${this.endpoint}/${id}`);
  }
}

export default BaseAdminService;
