import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ticketService from '@/apis/services/ticketService';
import type { SupportRealtimePayload, TicketResponse } from '@/types';
import { formatDateShort as formatDate } from '@/utils/format';
import { toast } from 'sonner';
import IconButton from '@/components/button/IconButton';
import CustomSelect from '@/components/input/CustomSelect';
import { STATUS_CONFIG } from '@/components/ui/constants';
import type { StatusType } from '@/components/ui/types';
import StatusBadge from '@/components/ui/StatusBadge';
import useAuthStore from '@/stores/useAuthStore';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';

const CLOSED_STATUSES = new Set(['CLOSED', 'RESOLVED']);
const SUPPORT_REALTIME_EVENTS = new Set<string>([
  REALTIME_EVENT_TYPES.SUPPORT_TICKET_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_STATUS_UPDATED,
]);

export default function SupportChatWidget() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const canDirectSupport = isAuthenticated && user?.role === 'USER';

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [draft, setDraft] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);



  const fetchTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!canDirectSupport) {
      setTickets([]);
      setSelectedTicketId(null);
      setSelectedTicket(null);
      return;
    }
    if (!opts?.silent) setLoading(true);
    try {
      const res = await ticketService.getMyTickets(1, 30);
      const nextTickets = res.data?.data || [];

      const nextTicketId =
        selectedTicketId && nextTickets.some((ticket) => ticket.id === selectedTicketId)
          ? selectedTicketId
          : (nextTickets.find((ticket) => !CLOSED_STATUSES.has(ticket.status))?.id || nextTickets[0]?.id || null);
      if (nextTicketId !== selectedTicketId) {
        setSelectedTicketId(nextTicketId);
      }
      setTickets(nextTickets);
    } catch {
      if (!opts?.silent) setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTicketId, isOpen, canDirectSupport]);

  const fetchSelectedTicket = useCallback(async (ticketId: string, opts?: { silent?: boolean }) => {
    if (!canDirectSupport) return;
    try {
      const res = await ticketService.getDetail(ticketId);
      setSelectedTicket(res.data);
    } catch {
      if (!opts?.silent) setSelectedTicket(null);
    }
  }, [canDirectSupport]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }
    fetchSelectedTicket(selectedTicketId);
  }, [selectedTicketId, fetchSelectedTicket]);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (!canDirectSupport) return;
      if (!SUPPORT_REALTIME_EVENTS.has(event.type)) {
        return;
      }

      const payload = (event.data || {}) as SupportRealtimePayload;
      const eventTicketId = payload.ticketId || null;

      if (
        event.type === REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED
        && payload.senderType === 'ADMIN'
        && !isOpen
        && eventTicketId
        && eventTicketId !== selectedTicketId
      ) {
        setUnreadCount((prev) => prev + 1);
      }

      fetchTickets({ silent: true });

      if (!selectedTicketId && eventTicketId) {
        setSelectedTicketId(eventTicketId);
        return;
      }

      if (selectedTicketId && eventTicketId && selectedTicketId === eventTicketId) {
        fetchSelectedTicket(selectedTicketId, { silent: true });
      }
    });

    return unsubscribe;
  }, [canDirectSupport, fetchSelectedTicket, fetchTickets, isOpen, selectedTicketId]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.id, selectedTicket?.messages, isOpen]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    if (!canDirectSupport) {
      toast.info('Vui lòng đăng nhập tài khoản khách hàng để chat trực tiếp với admin');
      navigate('/login');
      return;
    }

    setSending(true);
    try {
      if (selectedTicketId && selectedTicket && !CLOSED_STATUSES.has(selectedTicket.status)) {
        const res = await ticketService.reply(selectedTicketId, { content });
        setSelectedTicket(res.data);
      } else {
        const res = await ticketService.create({
          subject: 'Hỗ trợ trực tiếp',
          content,
        });
        const created = res.data;
        setSelectedTicket(created);
        setSelectedTicketId(created.id);
        toast.success('Đã tạo cuộc trò chuyện hỗ trợ');
      }
      setDraft('');
      await fetchTickets({ silent: true });
    } catch {
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const isClosed = Boolean(selectedTicket && CLOSED_STATUSES.has(selectedTicket.status));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-[55] bg-gradient-to-r from-purple-600 to-blue-600 ${
          isOpen ? 'hidden' : ''
        }`}
        aria-label="Mở hỗ trợ trực tiếp"
      >
        <FiMessageSquare className="text-xl sm:text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="fixed bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-[55] right-3 bottom-16 w-[280px] max-w-[82vw] h-[min(70dvh,600px)] sm:right-6 sm:bottom-24 sm:w-[360px] sm:h-[520px] sm:max-w-[92vw] sm:max-h-[88vh]"
          >
            <div className="h-14 px-3 sm:px-4 flex items-center justify-between text-white bg-gradient-to-r from-purple-600 to-blue-600">
              <div>
                <h3 className="font-bold text-sm">Hỗ trợ trực tiếp</h3>
                <p className="text-[11px] text-white/80">Realtime với admin</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="px-2.5 sm:px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              {loading && tickets.length === 0 ? (
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ) : tickets.length > 0 ? (
                <CustomSelect
                  value={selectedTicketId || ''}
                  onChange={(val) => setSelectedTicketId(val || null)}
                  options={tickets.map((ticket) => ({
                    value: ticket.id,
                    label: `${ticket.subject} – ${STATUS_CONFIG[ticket.status as StatusType]?.label || ticket.status}`,
                  }))}
                  className="w-full"
                />
              ) : (
                <p className="text-xs text-slate-500">
                  {canDirectSupport
                    ? 'Chưa có ticket, gửi tin nhắn để tạo mới.'
                    : 'Đăng nhập để bắt đầu chat trực tiếp với admin.'}
                </p>
              )}
            </div>

            <div className="px-2.5 sm:px-3 py-2 border-b border-slate-100 dark:border-slate-800 min-h-10 sm:min-h-11">
              {selectedTicket ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500 truncate">{selectedTicket.ticketNumber}</p>
                  <StatusBadge status={selectedTicket.status} className="text-[10px]" />
                </div>
              ) : (
                <p className="text-xs text-slate-400">Phiên chat mới</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 bg-slate-50 dark:bg-slate-900/50">
              {selectedTicket?.messages?.length ? (
                selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                        msg.senderType === 'USER'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-md'
                      }`}
                    >
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.senderType === 'USER' ? 'text-white/70' : 'text-slate-400'}`}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full min-h-24 flex items-center justify-center text-center text-slate-400 text-sm px-4">
                  <p>
                    {canDirectSupport
                      ? 'Bắt đầu cuộc trò chuyện với admin bằng cách gửi một tin nhắn.'
                      : 'Bạn cần đăng nhập để bắt đầu chat trực tiếp với admin.'}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800">
              {!canDirectSupport ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold"
                >
                  Đăng nhập để chat
                </button>
              ) : isClosed ? (
                <div className="h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm flex items-center">
                  Ticket đã đóng, gửi tin nhắn để tạo cuộc trò chuyện mới.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 h-9 sm:h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    placeholder="Nhập tin nhắn..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  />
                  <IconButton
                    icon={<FiSend />}
                    onClick={handleSend}
                    variant="primary"
                    size="md"
                    loading={sending}
                    disabled={!draft.trim()}
                    ariaLabel="Gửi tin nhắn hỗ trợ"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
