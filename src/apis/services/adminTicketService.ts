import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, TicketResponse, TicketMessageRequest } from '@/types';

const URL = '/tickets';

const adminTicketService = {
  getAll: (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<TicketResponse>>> =>
    adminAxios.get(URL, { params }),

  getById: (id: string): Promise<ApiResponse<TicketResponse>> =>
    adminAxios.get(`${URL}/${id}`),

  reply: (id: string, data: TicketMessageRequest): Promise<ApiResponse<TicketResponse>> =>
    adminAxios.post(`${URL}/${id}/reply`, data),

  updateStatus: (id: string, status: string): Promise<ApiResponse<TicketResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`, { status }),
};

export default adminTicketService;
