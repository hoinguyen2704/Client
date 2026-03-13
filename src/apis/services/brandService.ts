import BaseService from './baseService';
import type { BrandResponse, BrandRequest } from '@/types';

class BrandService extends BaseService<BrandResponse, BrandRequest> {
  constructor() {
    super('/brands');
  }
}

export default new BrandService();
