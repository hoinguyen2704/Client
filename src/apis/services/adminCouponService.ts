import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, CouponResponse, CouponRequest } from '@/types';

const URL = '/coupons';

const adminCouponService = {
  getAll: (params?: {
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<CouponResponse>>> =>
    adminAxios.get(URL, { params }),

  getById: (id: string): Promise<ApiResponse<CouponResponse>> =>
    adminAxios.get(`${URL}/${id}`),

  create: (data: CouponRequest): Promise<ApiResponse<CouponResponse>> =>
    adminAxios.post(URL, data),

  update: (id: string, data: CouponRequest): Promise<ApiResponse<CouponResponse>> =>
    adminAxios.put(`${URL}/${id}`, data),

  toggleStatus: (id: string): Promise<ApiResponse<CouponResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`),
};

export default adminCouponService;
