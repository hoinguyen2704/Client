import axios from '../axios';
import type { ApiResponse, PageResponse, NotificationResponse } from '@/types';

const NOTIFY_URL = '/notifications';

const notificationService = {
  getMyNotifications: (page = 1, size = 10): Promise<ApiResponse<PageResponse<NotificationResponse>>> =>
    axios.get(NOTIFY_URL, { params: { page, size } }),

  getUnreadCount: (): Promise<ApiResponse<{ count: number }>> =>
    axios.get(`${NOTIFY_URL}/unread-count`),

  markAsRead: (id: string): Promise<ApiResponse<void>> =>
    axios.patch(`${NOTIFY_URL}/${id}/read`),

  markAllAsRead: (): Promise<ApiResponse<void>> =>
    axios.patch(`${NOTIFY_URL}/read-all`),
};

export default notificationService;
