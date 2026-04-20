import { adminAxios } from '../axios';
import type { AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  DashboardRevenueResponse,
  DashboardReviewStatsResponse,
  DashboardStatsResponse,
  DashboardSummaryResponse,
  DashboardTopListsResponse,
  RecentOrderItem,
  TopVariantItem,
  ReportExportParams,
} from '@/types';

const adminDashboardService = {
  getStats: (period: string = 'MONTH', config?: AxiosRequestConfig): Promise<ApiResponse<DashboardStatsResponse>> =>
    adminAxios.get('/dashboard/stats', { ...(config || {}), params: { period } }),

  getSummary: (period: string = 'MONTH', config?: AxiosRequestConfig): Promise<ApiResponse<DashboardSummaryResponse>> =>
    adminAxios.get('/dashboard/summary', { ...(config || {}), params: { period } }),

  getRevenue: (period: string = 'MONTH', config?: AxiosRequestConfig): Promise<ApiResponse<DashboardRevenueResponse>> =>
    adminAxios.get('/dashboard/revenue', { ...(config || {}), params: { period } }),

  getTopLists: (period: string = 'MONTH', config?: AxiosRequestConfig): Promise<ApiResponse<DashboardTopListsResponse>> =>
    adminAxios.get('/dashboard/top-lists', { ...(config || {}), params: { period } }),

  getRecentOrders: (config?: AxiosRequestConfig): Promise<ApiResponse<RecentOrderItem[]>> =>
    adminAxios.get('/dashboard/recent-orders', config),

  getReviews: (period: string = 'MONTH', config?: AxiosRequestConfig): Promise<ApiResponse<DashboardReviewStatsResponse>> =>
    adminAxios.get('/dashboard/reviews', { ...(config || {}), params: { period } }),

  getTopVariants: (period: string = 'MONTH', limit: number = 50, config?: AxiosRequestConfig): Promise<ApiResponse<TopVariantItem[]>> =>
    adminAxios.get('/dashboard/top-variants', { ...(config || {}), params: { period, limit } }),

  /** Xuất báo cáo doanh thu Excel */
  exportReport: (period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/export', { params: { period }, responseType: 'blob' }),

  exportReportByRange: (params: ReportExportParams): Promise<Blob> =>
    adminAxios.get('/dashboard/report-export', { params, responseType: 'blob' }),

  /** Xuất báo cáo dashboard dạng PDF */
  exportReportPdf: (type: string, period: string = 'MONTH'): Promise<Blob> =>
    adminAxios.get('/dashboard/report-pdf', { params: { type, period }, responseType: 'blob' }),
};

export default adminDashboardService;
