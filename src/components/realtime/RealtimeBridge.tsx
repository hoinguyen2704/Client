import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/useAuthStore';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { emitRealtimeEvent } from '@/realtime/realtimeBus';
import type { RealtimeEventEnvelope, SupportRealtimePayload, UserNotificationRealtimePayload } from '@/types';

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 12000;

function resolveSupportWebSocketUrl(token: string): string | null {
  const apiUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (!apiUrl) return null;

  try {
    const parsed = new URL(apiUrl);
    const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${parsed.host}/ws/support?token=${encodeURIComponent(token)}`;
  } catch {
    return null;
  }
}

function handleUserToast(event: RealtimeEventEnvelope) {
  if (event.type === REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED) {
    const payload = (event.data || {}) as SupportRealtimePayload;
    if (payload.senderType === 'ADMIN') {
      toast.info(payload.ticketNumber ? `Admin đã phản hồi ${payload.ticketNumber}` : 'Admin vừa phản hồi hỗ trợ');
    }
    return;
  }

  if (event.type === REALTIME_EVENT_TYPES.SUPPORT_STATUS_UPDATED) {
    const payload = (event.data || {}) as SupportRealtimePayload;
    toast.info(payload.ticketNumber ? `Trạng thái ${payload.ticketNumber} đã cập nhật` : 'Yêu cầu hỗ trợ đã cập nhật trạng thái');
    return;
  }

  if (event.type === REALTIME_EVENT_TYPES.USER_NOTIFICATION_CREATED) {
    const payload = (event.data || {}) as UserNotificationRealtimePayload;
    if (payload.type === 'SUPPORT') return;
    toast.info(payload.title || 'Thông báo mới', {
      description: payload.content || '',
    });
  }
}

function handleAdminToast(event: RealtimeEventEnvelope) {
  if (event.type === REALTIME_EVENT_TYPES.SUPPORT_TICKET_CREATED) {
    const payload = (event.data || {}) as SupportRealtimePayload;
    toast.info(payload.userName ? `${payload.userName} vừa tạo yêu cầu hỗ trợ` : 'Có yêu cầu hỗ trợ mới từ người dùng');
    return;
  }

  if (event.type === REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED) {
    const payload = (event.data || {}) as SupportRealtimePayload;
    if (payload.senderType === 'USER') {
      toast.info(payload.ticketNumber
        ? `${payload.ticketNumber} có phản hồi mới từ khách hàng`
        : 'Khách hàng vừa gửi phản hồi mới');
    }
  }
}

export default function RealtimeBridge() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const wsUrl = isAuthenticated && token ? resolveSupportWebSocketUrl(token) : null;

    if (!wsUrl || !user) {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let disposed = false;

    const closeCurrentSocket = () => {
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.onmessage = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (disposed) return;
      if (reconnectTimerRef.current) return;

      const delay = Math.min(
        RECONNECT_MAX_DELAY_MS,
        RECONNECT_BASE_DELAY_MS * (2 ** reconnectAttemptsRef.current),
      );
      reconnectAttemptsRef.current += 1;

      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (disposed) return;

      closeCurrentSocket();
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (messageEvent) => {
        try {
          const parsed = JSON.parse(messageEvent.data) as RealtimeEventEnvelope;
          if (!parsed?.type) return;

          emitRealtimeEvent(parsed);
          if (user.role === 'ADMIN') {
            handleAdminToast(parsed);
          } else {
            handleUserToast(parsed);
          }
        } catch {
          // Ignore malformed payload
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        scheduleReconnect();
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      closeCurrentSocket();
    };
  }, [isAuthenticated, token, user?.id, user?.role]);

  return null;
}
