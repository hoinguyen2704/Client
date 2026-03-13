import axios from '../axios';
import type { ApiResponse, DashboardStatsResponse } from '@/types';

const DASHBOARD_URL = '/admin/dashboard';

const dashboardService = {
  getStats: (): Promise<ApiResponse<DashboardStatsResponse>> =>
    axios.get(`${DASHBOARD_URL}/stats`),
};

export default dashboardService;
