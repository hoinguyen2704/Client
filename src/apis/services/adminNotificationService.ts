import { adminAxios } from "../axios";
import type {
  ApiResponse,
  NotificationResponse,
  NotificationUnreadCountResponse,
  PageResponse,
} from "@/types";

const NOTIFY_URL = "/notifications";

const adminNotificationService = {
  getMyNotifications: (page = 1, size = 10): Promise<ApiResponse<PageResponse<NotificationResponse>>> =>
    adminAxios.get(NOTIFY_URL, { params: { page, size } }),

  getUnreadCount: (): Promise<ApiResponse<NotificationUnreadCountResponse>> =>
    adminAxios.get(`${NOTIFY_URL}/unread-count`),

  markAsRead: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.patch(`${NOTIFY_URL}/${id}/read`),

  markAllAsRead: (): Promise<ApiResponse<void>> =>
    adminAxios.patch(`${NOTIFY_URL}/read-all`),
};

export default adminNotificationService;
