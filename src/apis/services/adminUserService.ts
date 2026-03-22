import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, UserResponse } from '@/types';

const URL = '/users';

const adminUserService = {
  getAll: (params?: {
    keyword?: string;
    role?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PageResponse<UserResponse>>> =>
    adminAxios.get(URL, { params }),

  getById: (id: string): Promise<ApiResponse<UserResponse>> =>
    adminAxios.get(`${URL}/${id}`),

  toggleStatus: (id: string): Promise<ApiResponse<UserResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`),

  export: (params?: { keyword?: string; role?: string }): Promise<Blob> =>
    adminAxios.get(`${URL}/export`, { params, responseType: 'blob' }),
};

export default adminUserService;
