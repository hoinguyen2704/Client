import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, BrandResponse, BrandRequest } from '@/types';

class AdminBrandService extends BaseService<BrandResponse, BrandRequest> {
  constructor() {
    super('/brands', adminAxios);
  }
}

export default new AdminBrandService();
