import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import adminNotificationService from '@/apis/services/adminNotificationService';
import useAuthStore from '@/stores/useAuthStore';
import useNotificationStore from '@/stores/useNotificationStore';
import {
  getNotificationIcon,
  getNotificationTargetUrl,
} from '@/constants/notificationConstants';
import { formatDateShort as formatDate } from '@/utils/format';
import type { AdminNotificationRealtimePayload, NotificationResponse } from '@/types';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';

export default function AdminNotifications() {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminNotificationService.getMyNotifications(1, 50);
      setNotifications(res.data?.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (event.type !== REALTIME_EVENT_TYPES.ADMIN_NOTIFICATION_CREATED) return;

      const payload = event.data as AdminNotificationRealtimePayload | undefined;
      if (!payload?.id) return;

      const actorUserId = typeof payload.metadata?.actorUserId === 'string' ? payload.metadata.actorUserId : null;
      const normalizedPayload = actorUserId && actorUserId === currentUserId
        ? { ...payload, isRead: true }
        : payload;

      setNotifications((prev) => (
        prev.some((notification) => notification.id === payload.id)
          ? prev
          : [normalizedPayload, ...prev]
      ));
    });

    return unsubscribe;
  }, [currentUserId]);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await adminNotificationService.markAsRead(id);
      setNotifications((prev) => prev.map((notification) => (
        notification.id === id ? { ...notification, isRead: true } : notification
      )));
      useNotificationStore.getState().decrementUnread();
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await adminNotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      useNotificationStore.getState().clearUnread();
    } catch {
      // ignore
    }
  }, []);

  const handleNotificationClick = useCallback(async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }

    const targetUrl = getNotificationTargetUrl(notification);
    if (targetUrl) {
      navigate(targetUrl);
    }
  }, [handleMarkRead, navigate]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('notificationsPage.title')}</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => void handleMarkAllRead()}
            className="flex items-center gap-2 text-md text-blue-600 hover:underline font-medium"
          >
            <FiCheckCircle /> {t('notificationsPage.markAllRead', { count: unreadCount })}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <FiBell className="text-5xl text-subtle mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('notificationsPage.empty.title')}</h3>
          <p className="text-muted">{t('notificationsPage.empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => void handleNotificationClick(notification)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${notification.isRead ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-lg">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-md">{notification.title}</h4>
                    {!notification.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>
                  <p className="text-md text-muted line-clamp-2">{notification.content}</p>
                  <span className="text-sm text-subtle mt-2 block">{formatDate(notification.createdAt)}</span>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleMarkRead(notification.id);
                    }}
                    className="p-1 text-subtle hover:text-green-600 shrink-0"
                    title={t('notificationsPage.markReadTitle')}
                  >
                    <FiCheck />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
