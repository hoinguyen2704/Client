import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, CategoryResponse, CategoryRequest } from '@/types';

class AdminCategoryService extends BaseService<CategoryResponse, CategoryRequest> {
  constructor() {
    super('/categories', adminAxios);
  }

  toggleStatus = async (id: string): Promise<ApiResponse<CategoryResponse>> => {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  };
}

export default new AdminCategoryService();
