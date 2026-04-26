import BaseService from './baseService';
import { adminAxios } from '../axios';
import type {
  AdminCreateUserRequest,
  AvatarUploadResponse,
  AdminUpdatePhoneRequest,
  AdminUpdateUserProfileRequest,
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

  async createCustomer(data: AdminCreateUserRequest): Promise<ApiResponse<UserResponse>> {
    return this.http.post(this.endpoint, data);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<AvatarUploadResponse>> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.endpoint}/avatar-upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async export(params?: AdminUserExportParams): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }

  async updateProfile(id: string, data: AdminUpdateUserProfileRequest): Promise<ApiResponse<UserResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/profile`, data);
  }

  async updatePhone(id: string, data: AdminUpdatePhoneRequest): Promise<ApiResponse<UserResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/phone`, data);
  }
}

export default new AdminUserService();
