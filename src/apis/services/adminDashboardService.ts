import { adminAxios } from '../axios';
import type { ApiResponse, DashboardStatsResponse } from '@/types';

const adminDashboardService = {
  getStats: (period: string = 'MONTH'): Promise<ApiResponse<DashboardStatsResponse>> =>
    adminAxios.get('/dashboard/stats', { params: { period } }),

  /** Xuất báo cáo doanh thu Excel */
  exportReport: (period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/export', { params: { period }, responseType: 'blob' }),

  /** Xuất báo cáo dashboard dạng PDF */
  exportReportPdf: (type: string, period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/report-pdf', { params: { type, period }, responseType: 'blob' }),
};

export default adminDashboardService;
