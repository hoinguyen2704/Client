import type { AxiosInstance } from 'axios';
import clientAxios from '../axios';
import type { ApiResponse, PageResponse, PaginationParams } from '@/types';

/**
 * Generic CRUD service — kế thừa và gán endpoint cho từng entity.
 * Hỗ trợ cả client API và admin API bằng cách inject Axios instance.
 */
class BaseService<T, C = Partial<T>> {
  constructor(
    public endpoint: string,
    protected http: AxiosInstance = clientAxios,
  ) {}

  getAll = async (params?: PaginationParams & Record<string, unknown>): Promise<ApiResponse<PageResponse<T>>> => {
    return this.http.get(this.endpoint, { params });
  };

  getById = async (id: string): Promise<ApiResponse<T>> => {
    return this.http.get(`${this.endpoint}/${id}`);
  };

  create = async (data: C): Promise<ApiResponse<T>> => {
    return this.http.post(this.endpoint, data);
  };

  update = async (id: string, data: Partial<C>): Promise<ApiResponse<T>> => {
    return this.http.put(`${this.endpoint}/${id}`, data);
  };

  delete = async (id: string): Promise<ApiResponse<void>> => {
    return this.http.delete(`${this.endpoint}/${id}`);
  };
}

export default BaseService;
