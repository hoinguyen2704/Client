import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiBell, FiCheck, FiCheckCircle, FiShoppingBag, FiTag, FiInfo, FiMessageSquare } from 'react-icons/fi';
import notificationService from '@/apis/services/notificationService';
import useNotificationStore from '@/stores/useNotificationStore';
import { formatDateShort as formatDate } from '@/utils/format';
import type { NotificationResponse, UserNotificationRealtimePayload } from '@/types';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';

const typeIcons: Record<string, React.ReactNode> = {
  ORDER: <FiShoppingBag className="text-blue-500" />,
  SUPPORT: <FiMessageSquare className="text-amber-500" />,
  TICKET: <FiMessageSquare className="text-amber-500" />,
  PROMOTION: <FiTag className="text-blue-500" />,
  SYSTEM: <FiInfo className="text-slate-500" />,
};

export default function Notifications() {
  const { t } = useTranslation('account');
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
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      useNotificationStore.getState().clearUnread();
    } catch { /* ignore */ }
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
          <FiBell className="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('notificationsPage.empty.title')}</h3>
          <p className="text-slate-500">{t('notificationsPage.empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${n.isRead ? 'border-slate-100 dark:border-slate-800 opacity-70' : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-lg">
                  {typeIcons[n.type] || <FiBell />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-md">{n.title}</h4>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>
                  <p className="text-md text-slate-500 line-clamp-2">{n.content}</p>
                  <span className="text-sm text-slate-400 mt-2 block">{formatDate(n.createdAt)}</span>
                </div>
                {!n.isRead && (
                  <button className="p-1 text-slate-400 hover:text-green-600 shrink-0" title={t('notificationsPage.markReadTitle')}><FiCheck /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
