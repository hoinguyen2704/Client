import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, UserResponse } from '@/types';

class AdminUserService extends BaseService<UserResponse> {
  constructor() {
    super('/users', adminAxios);
  }

  async toggleStatus(id: string): Promise<ApiResponse<UserResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  }

  async export(params?: { keyword?: string; role?: string }): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }
}

export default new AdminUserService();
