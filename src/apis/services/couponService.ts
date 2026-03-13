import axios from '../axios';
import type { ApiResponse, CouponResponse } from '@/types';

const COUPON_URL = '/coupons';

const couponService = {
  validate: (code: string, orderAmount?: number): Promise<ApiResponse<CouponResponse>> =>
    axios.get(`${COUPON_URL}/validate`, { params: { code, orderAmount } }),
};

export default couponService;
