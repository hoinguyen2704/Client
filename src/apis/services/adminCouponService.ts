import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, CouponResponse, CouponRequest, ReportExportParams } from '@/types';

class AdminCouponService extends BaseService<CouponResponse, CouponRequest> {
  constructor() {
    super('/coupons', adminAxios);
  }

  toggleStatus = async (id: string): Promise<ApiResponse<CouponResponse>> => {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  };

  exportReportByRange = async (params: ReportExportParams & { keyword?: string }): Promise<Blob> => {
    return this.http.get(`${this.endpoint}/report-export`, { params, responseType: 'blob' });
  };
}

export default new AdminCouponService();
