import axios from '../axios';
import type { ApiResponse, PageResponse, TicketResponse, TicketRequest, TicketMessageRequest } from '@/types';

const TICKET_URL = '/tickets';

const ticketService = {
  getMyTickets: (page = 1, size = 10): Promise<ApiResponse<PageResponse<TicketResponse>>> =>
    axios.get(TICKET_URL, { params: { page, size } }),

  getDetail: (id: string): Promise<ApiResponse<TicketResponse>> =>
    axios.get(`${TICKET_URL}/${id}`),

  create: (data: TicketRequest): Promise<ApiResponse<TicketResponse>> =>
    axios.post(TICKET_URL, data),

  reply: (id: string, data: TicketMessageRequest): Promise<ApiResponse<TicketResponse>> =>
    axios.post(`${TICKET_URL}/${id}/reply`, data),

  submitContact: (data: { name: string; email: string; phone: string; subject: string; message: string }): Promise<ApiResponse<TicketResponse>> =>
    axios.post('/public/contact', data),
};

export default ticketService;
