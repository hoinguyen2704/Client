import axios from '../axios';
import type { ApiResponse, CouponResponse } from '@/types';

const URL = '/my-coupons';

const userCouponService = {
  /** Lấy danh sách voucher công khai (có đánh dấu đã lưu) */
  getPublicCoupons: (): Promise<ApiResponse<CouponResponse[]>> =>
    axios.get(`${URL}/public`),

  /** Lấy danh sách voucher đã lưu của user */
  getMySavedCoupons: (): Promise<ApiResponse<CouponResponse[]>> =>
    axios.get(URL),

  /** Lưu voucher vào ví */
  saveCoupon: (couponId: string): Promise<ApiResponse<void>> =>
    axios.post(`${URL}/${couponId}`),

  /** Bỏ lưu voucher */
  unsaveCoupon: (couponId: string): Promise<ApiResponse<void>> =>
    axios.delete(`${URL}/${couponId}`),
};

export default userCouponService;
