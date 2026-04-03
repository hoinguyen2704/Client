import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, TicketResponse, TicketMessageRequest } from '@/types';

class AdminTicketService extends BaseService<TicketResponse> {
  constructor() {
    super('/tickets', adminAxios);
  }

  async reply(id: string, data: TicketMessageRequest): Promise<ApiResponse<TicketResponse>> {
    return this.http.post(`${this.endpoint}/${id}/reply`, data);
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<TicketResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`, { status });
  }
}

export default new AdminTicketService();
