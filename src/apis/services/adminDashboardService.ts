import { adminAxios } from '../axios';
import type { ApiResponse, DashboardStatsResponse, TopVariantItem } from '@/types';

const adminDashboardService = {
  getStats: (period: string = 'MONTH'): Promise<ApiResponse<DashboardStatsResponse>> =>
    adminAxios.get('/dashboard/stats', { params: { period } }),

  getTopVariants: (period: string = 'MONTH', limit: number = 50): Promise<ApiResponse<TopVariantItem[]>> =>
    adminAxios.get('/dashboard/top-variants', { params: { period, limit } }),

  /** Xuất báo cáo doanh thu Excel */
  exportReport: (period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/export', { params: { period }, responseType: 'blob' }),

  /** Xuất báo cáo dashboard dạng PDF */
  exportReportPdf: (type: string, period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/report-pdf', { params: { type, period }, responseType: 'blob' }),
};

export default adminDashboardService;
