import { useState, useRef, useCallback, useEffect } from 'react';
import { FiBell, FiCheck, FiCheckCircle, FiShoppingBag, FiTag, FiInfo, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '@/hooks';
import useNotificationStore from '@/stores/useNotificationStore';
import notificationService from '@/apis/services/notificationService';
import { formatDateShort as formatDate } from '@/utils/format';
import type { NotificationDropdownProps, NotificationResponse } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  ORDER: <FiShoppingBag className="text-blue-500" />,
  SUPPORT: <FiMessageSquare className="text-amber-500" />,
  TICKET: <FiMessageSquare className="text-amber-500" />,
  PROMOTION: <FiTag className="text-indigo-500" />,
  SYSTEM: <FiInfo className="text-muted" />,
};

const BELL_BUTTON_CLASS =
  "p-2 sm:p-2.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative";

export default function NotificationDropdown({ iconSize = 'text-xl' }: NotificationDropdownProps) {
  const { t } = useTranslation(['layout', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const syncFromServer = useNotificationStore((s) => s.syncFromServer);

  useClickOutside(dropdownRef, useCallback(() => setIsOpen(false), []));

  // Sync unread count on mount
  useEffect(() => { syncFromServer(); }, [syncFromServer]);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    notificationService.getMyNotifications(1, 5)
      .then((res) => {
        if (!cancelled) setLocalNotifications(res.data?.data || []);
      })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      useNotificationStore.getState().decrementUnread();
    } catch { /* ignore */ }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      useNotificationStore.getState().clearUnread();
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className={BELL_BUTTON_CLASS}
      >
        <FiBell className={iconSize} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-10 font-bold flex items-center justify-center rounded-full shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[90vw] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-md">{t('notifications.title', { ns: 'layout' })}</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-11 font-bold rounded-full">
                    {t('notifications.newCount', { ns: 'layout', count: unreadCount })}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <FiCheckCircle className="text-sm" />
                  {t('notifications.markAllRead', { ns: 'layout' })}
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-full" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : localNotifications.length === 0 ? (
                <div className="py-10 text-center">
                  <FiBell className="text-3xl text-subtle mx-auto mb-3" />
                  <p className="text-sm text-subtle">{t('notifications.empty', { ns: 'layout' })}</p>
                </div>
              ) : (
                localNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 ${!n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base">
                      {typeIcons[n.type] || <FiBell className="text-subtle" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="font-semibold text-sm truncate">{n.title}</h4>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                      <p className="text-sm text-muted line-clamp-2 leading-snug">{n.content}</p>
                      <span className="text-11 text-subtle mt-1 block">{formatDate(n.createdAt)}</span>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        className="p-1 text-subtle hover:text-green-600 shrink-0 mt-0.5"
                        title={t('notifications.markRead', { ns: 'layout' })}
                      >
                        <FiCheck className="text-sm" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/user/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                {t('notifications.viewAll', { ns: 'layout' })}
                <FiExternalLink className="text-sm" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
