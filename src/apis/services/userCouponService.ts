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
  saveCoupon: (code: string): Promise<ApiResponse<void>> =>
    axios.post(`${URL}/${encodeURIComponent(code.trim())}`),

  /** Bỏ lưu voucher */
  unsaveCoupon: (code: string): Promise<ApiResponse<void>> =>
    axios.delete(`${URL}/${encodeURIComponent(code.trim())}`),
};

export default userCouponService;
