import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import notificationService from '@/apis/services/notificationService';
import useNotificationStore from '@/stores/useNotificationStore';
import {
  getNotificationIcon,
  getNotificationTargetUrl,
} from '@/constants/notificationConstants';
import { formatDateShort as formatDate } from '@/utils/format';
import type { NotificationResponse, UserNotificationRealtimePayload } from '@/types';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';

export default function Notifications() {
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (event.type !== REALTIME_EVENT_TYPES.USER_NOTIFICATION_CREATED) return;
      const payload = event.data as UserNotificationRealtimePayload | undefined;
      if (!payload?.id) return;
      setNotifications((prev) => (prev.some((n) => n.id === payload.id) ? prev : [payload, ...prev]));
    });
    return unsubscribe;
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications(1, 50);
      setNotifications(res.data?.data || []);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      useNotificationStore.getState().decrementUnread();
      return true;
    } catch { /* ignore */ }
    return false;
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      useNotificationStore.getState().clearUnread();
    } catch { /* ignore */ }
  };
  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }

    const targetUrl = getNotificationTargetUrl(notification);
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('notificationsPage.title')}</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 text-md text-blue-600 hover:underline font-medium">
            <FiCheckCircle /> {t('notificationsPage.markAllRead', { count: unreadCount })}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <FiBell className="text-5xl text-subtle mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('notificationsPage.empty.title')}</h3>
          <p className="text-muted">{t('notificationsPage.empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} onClick={() => void handleNotificationClick(n)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${n.isRead ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-lg">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-md">{n.title}</h4>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>
                  <p className="text-md text-muted line-clamp-2">{n.content}</p>
                  <span className="text-sm text-subtle mt-2 block">{formatDate(n.createdAt)}</span>
                </div>
                {!n.isRead && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleMarkRead(n.id);
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
