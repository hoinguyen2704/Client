import axios from '../axios';
import type { ApiResponse, PageResponse, TicketResponse } from '@/types';

const TICKET_URL = '/tickets';

const ticketService = {
  getMyTickets: (page = 1, size = 10): Promise<ApiResponse<PageResponse<TicketResponse>>> =>
    axios.get(TICKET_URL, { params: { page, size } }),

  getDetail: (id: string): Promise<ApiResponse<TicketResponse>> =>
    axios.get(`${TICKET_URL}/${id}`),

  create: (data: { subject: string; message: string }): Promise<ApiResponse<TicketResponse>> =>
    axios.post(TICKET_URL, data),

  reply: (id: string, data: { content: string }): Promise<ApiResponse<TicketResponse>> =>
    axios.post(`${TICKET_URL}/${id}/reply`, data),
};

export default ticketService;
