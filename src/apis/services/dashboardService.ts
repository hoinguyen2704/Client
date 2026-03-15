import { adminAxios } from '../axios';
import type { ApiResponse, DashboardStatsResponse } from '@/types';

const DASHBOARD_URL = '/dashboard';

const dashboardService = {
  getStats: (): Promise<ApiResponse<DashboardStatsResponse>> =>
    adminAxios.get(`${DASHBOARD_URL}/stats`),
};

export default dashboardService;
