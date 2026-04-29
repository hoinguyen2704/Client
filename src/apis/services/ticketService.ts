import axios from '../axios';
import type {
  ApiResponse,
  ContactTicketRequest,
  PageResponse,
  TicketMessageRequest,
  TicketRequest,
  TicketResponse,
} from '@/types';

const TICKET_URL = '/tickets';

const ticketService = {
  getMyTickets: (page = 1, size = 10): Promise<ApiResponse<PageResponse<TicketResponse>>> =>
    axios.get(TICKET_URL, { params: { page, size } }),

  getDetail: (ticketNumber: string): Promise<ApiResponse<TicketResponse>> =>
    axios.get(`${TICKET_URL}/${ticketNumber}`),

  create: (data: TicketRequest): Promise<ApiResponse<TicketResponse>> =>
    axios.post(TICKET_URL, data),

  reply: (ticketNumber: string, data: TicketMessageRequest): Promise<ApiResponse<TicketResponse>> =>
    axios.post(`${TICKET_URL}/${ticketNumber}/reply`, data),

  submitContact: (data: ContactTicketRequest): Promise<ApiResponse<TicketResponse>> =>
    axios.post('/public/contact', data),
};

export default ticketService;
