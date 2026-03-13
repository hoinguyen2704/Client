import axios from '../axios';
import type { ApiResponse, UserResponse } from '@/types';

const USER_URL = '/users';

const userService = {
  getProfile: (): Promise<ApiResponse<UserResponse>> =>
    axios.get(`${USER_URL}/me`),

  updateProfile: (data: { fullName?: string; phone?: string }): Promise<ApiResponse<UserResponse>> =>
    axios.put(`${USER_URL}/me`, data),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> =>
    axios.put(`${USER_URL}/change-password`, data),

  uploadAvatar: (file: File): Promise<ApiResponse<UserResponse>> => {
    const form = new FormData();
    form.append('file', file);
    return axios.post(`${USER_URL}/me/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default userService;
