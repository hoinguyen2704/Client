import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FiMessageSquare, FiPlus, FiChevronRight, FiSend } from 'react-icons/fi';
import ticketService from '@/apis/services/ticketService';
import { formatDateShort as formatDate } from '@/utils/format';
import type { SupportRealtimePayload, TicketResponse } from '@/types';
import { Button, IconButton } from '@/components';
import { toast } from 'sonner';
import { TICKET_STATUS_OPTIONS } from '@/constants/ticketConstants';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';

const CLOSED_STATUSES = new Set(['CLOSED', 'RESOLVED']);
const SUPPORT_REALTIME_EVENTS = new Set<string>([
  REALTIME_EVENT_TYPES.SUPPORT_TICKET_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_STATUS_UPDATED,
]);

export default function Support() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const statusMap = useMemo(
    () =>
      TICKET_STATUS_OPTIONS.reduce((acc, item) => {
        acc[item.value] = { label: item.label, colorClass: item.colorClass };
        return acc;
      }, {} as Record<string, { label: string; colorClass: string }>),
    [],
  );

  const fetchTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await ticketService.getMyTickets(1, 30);
      const nextTickets = res.data?.data || [];
      const nextSelectedId =
        selectedTicketId && nextTickets.some((ticket) => ticket.id === selectedTicketId)
          ? selectedTicketId
          : nextTickets[0]?.id || null;
      if (nextSelectedId !== selectedTicketId) {
        setSelectedTicketId(nextSelectedId);
      }
      setTickets(nextTickets);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTicketId]);

  const fetchTicketDetail = useCallback(async (ticketId: string, opts?: { silent?: boolean }) => {
    try {
      const res = await ticketService.getDetail(ticketId);
      setSelectedTicket(res.data);
    } catch {
      if (!opts?.silent) toast.error('Không tải được chi tiết yêu cầu');
      setSelectedTicket(null);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }
    fetchTicketDetail(selectedTicketId);
  }, [selectedTicketId, fetchTicketDetail]);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (!SUPPORT_REALTIME_EVENTS.has(event.type)) {
        return;
      }

      const payload = (event.data || {}) as SupportRealtimePayload;
      const eventTicketId = payload.ticketId || null;

      fetchTickets({ silent: true });

      if (!selectedTicketId && eventTicketId) {
        setSelectedTicketId(eventTicketId);
        return;
      }

      const ticketToRefresh = eventTicketId && eventTicketId === selectedTicketId
        ? eventTicketId
        : selectedTicketId;
      if (ticketToRefresh) {
        fetchTicketDetail(ticketToRefresh, { silent: true });
      }
    });

    return unsubscribe;
  }, [fetchTickets, fetchTicketDetail, selectedTicketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.id, selectedTicket?.messages]);

  const handleCreate = async () => {
    if (!newSubject.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const res = await ticketService.create({
        subject: newSubject.trim(),
        content: newContent.trim(),
      });
      const created = res.data;
      setNewSubject('');
      setNewContent('');
      toast.success('Đã gửi yêu cầu hỗ trợ');
      await fetchTickets({ silent: true });
      if (created?.id) {
        setSelectedTicketId(created.id);
        setSelectedTicket(created);
      }
    } catch {
      toast.error('Gửi yêu cầu thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicketId || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await ticketService.reply(selectedTicketId, { content: replyText.trim() });
      setSelectedTicket(res.data);
      setReplyText('');
      await fetchTickets({ silent: true });
    } catch {
      toast.error('Gửi phản hồi thất bại');
    } finally {
      setSendingReply(false);
    }
  };

  const isChatClosed = Boolean(selectedTicket && CLOSED_STATUSES.has(selectedTicket.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hỗ trợ</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[620px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <h2 className="font-bold text-slate-900 dark:text-white">Tạo yêu cầu mới</h2>
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              placeholder="Tiêu đề hỗ trợ"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <textarea
              className="w-full h-24 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none"
              placeholder="Mô tả vấn đề của bạn..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <Button
              onClick={handleCreate}
              size="md"
              icon={<FiPlus />}
              loading={creating}
              disabled={!newSubject.trim() || !newContent.trim()}
              fullWidth
            >
              Gửi yêu cầu
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FiMessageSquare className="text-3xl mx-auto mb-2" />
                <p className="text-sm">Bạn chưa có yêu cầu hỗ trợ nào</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedTicketId === ticket.id
                      ? 'bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-600'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {ticket.ticketNumber} • {formatDate(ticket.createdAt)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{ticket.messages?.length || 0} tin nhắn</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${
                          statusMap[ticket.status]?.colorClass || 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {statusMap[ticket.status]?.label || ticket.status}
                      </span>
                      <FiChevronRight className="text-slate-400" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[620px] overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold">{selectedTicket.subject}</h2>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${
                      statusMap[selectedTicket.status]?.colorClass || 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {statusMap[selectedTicket.status]?.label || selectedTicket.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {selectedTicket.ticketNumber} • {formatDate(selectedTicket.createdAt)}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/80 dark:bg-slate-900/50">
                {(selectedTicket.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm ${
                        msg.senderType === 'USER'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md'
                      }`}
                    >
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      <p
                        className={`text-[11px] mt-2 ${
                          msg.senderType === 'USER' ? 'text-white/70' : 'text-slate-400'
                        }`}
                      >
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                {isChatClosed ? (
                  <div className="h-11 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 flex items-center">
                    Ticket đã đóng, bạn không thể gửi thêm phản hồi.
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      placeholder="Nhập phản hồi..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                    />
                    <IconButton
                      onClick={handleReply}
                      icon={<FiSend />}
                      size="md"
                      variant="primary"
                      loading={sendingReply}
                      disabled={!replyText.trim()}
                      ariaLabel="Gửi phản hồi"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-10 text-center">
              <div>
                <FiMessageSquare className="text-4xl mx-auto mb-3" />
                <p>Chọn một yêu cầu bên trái để bắt đầu chat với admin</p>
                <p className="text-sm mt-1">Tin nhắn sẽ được cập nhật realtime.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
