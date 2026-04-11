import { create } from 'zustand';
import notificationService from '@/apis/services/notificationService';
import type { NotificationState } from '@/types';

const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  recentNotifications: [],

  syncFromServer: async () => {
    try {
      // Check auth token directly — avoids circular import with useAuthStore
      const raw = localStorage.getItem('auth') || sessionStorage.getItem('auth');
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      if (!token) {
        set({ unreadCount: 0 });
        return;
      }
      const res = await notificationService.getUnreadCount();
      const count = typeof res.data?.count === 'number' ? res.data.count : 0;
      set({ unreadCount: count });
    } catch {
      // API failed — keep current count
    }
  },

  fetchRecent: async () => {
    try {
      const raw = localStorage.getItem('auth') || sessionStorage.getItem('auth');
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      if (!token) return;
      const res = await notificationService.getMyNotifications(1, 5);
      set({ recentNotifications: res.data?.data || [] });
    } catch {
      // ignore
    }
  },

  incrementUnread: (notification) =>
    set((s) => ({
      unreadCount: s.unreadCount + 1,
      recentNotifications: notification
        ? [notification, ...s.recentNotifications].slice(0, 5)
        : s.recentNotifications,
    })),

  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),

  clearUnread: () => set({ unreadCount: 0 }),

  reset: () => set({ unreadCount: 0, recentNotifications: [] }),
}));

export default useNotificationStore;
