import { adminAxios } from '../axios';
import type { ApiResponse, DashboardStatsResponse } from '@/types';

const adminDashboardService = {
  getStats: (period: string = 'MONTH') =>
    adminAxios.get<DashboardStatsResponse>('/dashboard/stats', { params: { period } }),
};

export default adminDashboardService;
