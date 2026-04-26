export type NotificationRole = "ADMIN" | "USER";

//  Notification
export interface NotificationResponse {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  eventCode?: string;
  orderId?: string;
  targetUrl?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationUnreadCountResponse {
  count: number;
}

export interface NotificationState {
  unreadCount: number;
  recentNotifications: NotificationResponse[];

  /** Fetch unread count from server */
  syncFromServer: () => Promise<void>;
  /** Fetch 5 most recent notifications for dropdown preview */
  fetchRecent: () => Promise<void>;
  /** +1 unread, optionally prepend to recent list (from realtime) */
  incrementUnread: (notification?: NotificationResponse) => void;
  /** -1 unread (after marking one as read) */
  decrementUnread: () => void;
  /** Reset unread to 0 (after marking all as read) */
  clearUnread: () => void;
  /** Full reset on logout */
  reset: () => void;
}
