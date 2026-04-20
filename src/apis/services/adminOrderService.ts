import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { AxiosRequestConfig } from 'axios';
import type { AdminOrderListItem, ApiResponse, OrderResponse, PageResponse, ReportExportParams } from '@/types';

class AdminOrderService extends BaseService<OrderResponse> {
  constructor() {
    super('/orders', adminAxios);
  }

  async getList(
    params?: {
      status?: string;
      keyword?: string;
      page?: number;
      size?: number;
    },
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<PageResponse<AdminOrderListItem>>> {
    return this.http.get(this.endpoint, { ...(config || {}), params });
  }

  async getByNumber(orderNumber: string): Promise<ApiResponse<OrderResponse>> {
    return this.http.get(`${this.endpoint}/${orderNumber}`);
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<OrderResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`, { status });
  }

  async export(params?: {
    status?: string;
    keyword?: string;
    from?: string;
    to?: string;
  }): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }

  async exportReportByRange(params: ReportExportParams & {
    status?: string;
    keyword?: string;
  }): Promise<Blob> {
    return this.http.get(`${this.endpoint}/report-export`, { params, responseType: 'blob' });
  }

  /** Xuất hóa đơn PDF cho 1 đơn hàng */
  async exportInvoice(orderId: string): Promise<Blob> {
    return this.http.get(`${this.endpoint}/${orderId}/invoice`, { responseType: 'blob' });
  }
}

export default new AdminOrderService();
