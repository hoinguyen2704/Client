import type { RealtimeEventType } from '@/constants/realtimeConstants';
import type { NotificationResponse } from './notification';

export interface SupportRealtimePayload {
  ticketId?: string;
  ticketNumber?: string;
  subject?: string;
  status?: string;
  userId?: string;
  userName?: string;
  senderType?: string;
  messageId?: string;
  messagePreview?: string;
  messageCreatedAt?: string;
}

export interface RealtimeEventEnvelope<T = unknown> {
  type: RealtimeEventType | string;
  data: T;
  timestamp?: string;
}

export type UserNotificationRealtimePayload = NotificationResponse;
