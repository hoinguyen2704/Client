import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, SystemConfigResponse, SystemConfigRequest } from '@/types';

const URL = '/system-configs';

const adminSystemConfigService = {
  getAll: (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<SystemConfigResponse>>> =>
    adminAxios.get(URL, { params }),

  getByKey: (key: string): Promise<ApiResponse<SystemConfigResponse>> =>
    adminAxios.get(`${URL}/key/${key}`),

  saveOrUpdate: (data: SystemConfigRequest): Promise<ApiResponse<SystemConfigResponse>> =>
    adminAxios.post(URL, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/${id}`),
};

export default adminSystemConfigService;
