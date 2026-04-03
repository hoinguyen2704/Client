import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, CouponResponse, CouponRequest } from '@/types';

class AdminCouponService extends BaseService<CouponResponse, CouponRequest> {
  constructor() {
    super('/coupons', adminAxios);
  }

  async toggleStatus(id: string): Promise<ApiResponse<CouponResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  }
}

export default new AdminCouponService();
