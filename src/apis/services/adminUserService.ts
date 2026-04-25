import BaseService from './baseService';
import { adminAxios } from '../axios';
import type {
  AdminUpdatePhoneRequest,
  AdminUserExportParams,
  ApiResponse,
  UserResponse,
} from '@/types';

class AdminUserService extends BaseService<UserResponse> {
  constructor() {
    super('/users', adminAxios);
  }

  async toggleStatus(id: string): Promise<ApiResponse<UserResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  }

  async export(params?: AdminUserExportParams): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }

  async updatePhone(id: string, data: AdminUpdatePhoneRequest): Promise<ApiResponse<UserResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/phone`, data);
  }
}

export default new AdminUserService();
