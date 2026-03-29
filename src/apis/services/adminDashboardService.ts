import { adminAxios } from '../axios';
import type { ApiResponse, DashboardStatsResponse } from '@/types';

const adminDashboardService = {
  getStats: (period: string = 'MONTH') =>
    adminAxios.get<DashboardStatsResponse>('/dashboard/stats', { params: { period } }),

  /** Xuất báo cáo doanh thu Excel */
  exportReport: (period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/export', { params: { period }, responseType: 'blob' }),
};

export default adminDashboardService;
