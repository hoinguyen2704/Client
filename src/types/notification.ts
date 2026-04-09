//  Notification
export interface NotificationResponse {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  orderId?: string;
  createdAt: string;
}
