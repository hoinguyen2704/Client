//  Ticket
export interface TicketRequest {
  subject: string;
  content: string;
  attachmentsJson?: string;
}

export interface TicketMessageRequest {
  content: string;
  attachmentsJson?: string;
}

export interface ContactTicketRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface TicketResponse {
  id: string;
  ticketNumber?: string;
  subject: string;
  status: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  messages: TicketMessageResponse[];
}

export interface TicketMessageResponse {
  id: string;
  senderType: string; // USER, ADMIN, AI_BOT
  content: string;
  attachmentsJson?: string;
  createdAt: string;
}
