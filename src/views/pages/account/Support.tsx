import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiMessageSquare, FiPlus, FiSend } from 'react-icons/fi';
import ticketService from '@/apis/services/ticketService';
import { formatDateShort as formatDate } from '@/utils/format';
import type { SupportRealtimePayload, TicketResponse } from '@/types';
import { Button, IconButton, FormInput, FormTextarea, StatusBadge } from '@/components';
import TicketListItem from '@/components/ticket/TicketListItem';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';
import { useTranslation } from 'react-i18next';

const CLOSED_STATUSES = new Set(['CLOSED', 'RESOLVED']);
const SUPPORT_REALTIME_EVENTS = new Set<string>([
  REALTIME_EVENT_TYPES.SUPPORT_TICKET_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_STATUS_UPDATED,
]);
const getTicketKey = (ticket?: TicketResponse | null) => ticket?.ticketNumber || ticket?.id || null;
const getPayloadTicketKey = (payload?: SupportRealtimePayload | null) => payload?.ticketNumber || payload?.ticketId || null;

export default function Support() {
  const { t } = useTranslation('account');
  const [searchParams, setSearchParams] = useSearchParams();
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
  const selectedTicketIdRef = useRef(selectedTicketId);
  const requestedTicketId = searchParams.get('ticketNumber') || searchParams.get('ticketId');
  selectedTicketIdRef.current = selectedTicketId;

  const syncSelectedTicketId = useCallback((ticketId: string | null) => {
    setSelectedTicketId(ticketId);
    const nextSearchParams = new URLSearchParams(searchParams);
    if (ticketId) {
      nextSearchParams.set('ticketNumber', ticketId);
      nextSearchParams.delete('ticketId');
    } else {
      nextSearchParams.delete('ticketNumber');
      nextSearchParams.delete('ticketId');
    }
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await ticketService.getMyTickets(1, 30);
      const nextTickets = res.data?.data || [];
      const currentId = selectedTicketIdRef.current;
      const stillExists = currentId ? nextTickets.some((t) => getTicketKey(t) === currentId) : false;

      if (requestedTicketId && requestedTicketId !== currentId) {
        setSelectedTicketId(requestedTicketId);
      } else if (!stillExists) {
        setSelectedTicketId(getTicketKey(nextTickets[0]));
      }
      setTickets(nextTickets);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [requestedTicketId]);

  const fetchTicketDetail = useCallback(async (ticketId: string, opts?: { silent?: boolean }) => {
    try {
      const res = await ticketService.getDetail(ticketId);
      setSelectedTicket(res.data);
    } catch {
      if (!opts?.silent) toast.error(t('support.toasts.loadDetailFailed'));
      setSelectedTicket(null);

      if (requestedTicketId && requestedTicketId === ticketId) {
        const fallbackTicketId = getTicketKey(tickets[0]);
        if (fallbackTicketId && fallbackTicketId !== ticketId) {
          syncSelectedTicketId(fallbackTicketId);
        } else if (!fallbackTicketId) {
          syncSelectedTicketId(null);
        }
      }
    }
  }, [requestedTicketId, syncSelectedTicketId, t, tickets]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (requestedTicketId && requestedTicketId !== selectedTicketId) {
      setSelectedTicketId(requestedTicketId);
    }
  }, [requestedTicketId, selectedTicketId]);

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
      const eventTicketId = getPayloadTicketKey(payload);

      fetchTickets({ silent: true });

      if (!selectedTicketId && eventTicketId) {
        syncSelectedTicketId(eventTicketId);
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
    const chatEnd = chatEndRef.current;
    const container = chatEnd?.parentElement;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
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
      toast.success(t('support.toasts.createSuccess'));
      await fetchTickets({ silent: true });
      const createdTicketKey = getTicketKey(created);
      if (createdTicketKey) {
        syncSelectedTicketId(createdTicketKey);
        setSelectedTicket(created);
      }
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, t, 'support.toasts.createFailed'));
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
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, t, 'support.toasts.replyFailed'));
    } finally {
      setSendingReply(false);
    }
  };

  const isChatClosed = Boolean(selectedTicket && CLOSED_STATUSES.has(selectedTicket.status));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">{t('support.title')}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[46dvh] min-h-[300px] sm:min-h-[340px] lg:h-[calc(100dvh-420px)] lg:min-h-[500px]">
          <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5 sm:space-y-3">
            <h2 className="font-bold text-ink">{t('support.createTitle')}</h2>
            <FormInput
              placeholder={t('support.subjectPlaceholder')}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <FormTextarea
              placeholder={t('support.contentPlaceholder')}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleCreate}
              size="md"
              icon={<FiPlus />}
              loading={creating}
              disabled={!newSubject.trim() || !newContent.trim()}
              fullWidth
            >
              {t('support.createAction')}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1 min-h-0">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-subtle">
                <FiMessageSquare className="text-3xl mx-auto mb-2" />
                <p className="text-md">{t('support.emptyTickets')}</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <TicketListItem
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicketId === getTicketKey(ticket)}
                  onClick={(ticketResponse) => syncSelectedTicketId(getTicketKey(ticketResponse))}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[52dvh] min-h-[320px] sm:min-h-[360px] lg:h-[calc(100dvh-420px)] lg:min-h-[500px] overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-3 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-base sm:text-lg font-bold">{selectedTicket.subject}</h2>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <p className="text-md sm:text-base text-muted">
                  {selectedTicket.ticketNumber} • {formatDate(selectedTicket.createdAt)}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-slate-50/80 dark:bg-slate-900/50 min-h-0">
                {(selectedTicket.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[82%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-md sm:text-base ${
                        msg.senderType === 'USER'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 text-body border border-slate-100 dark:border-slate-700 rounded-bl-md'
                      }`}
                    >
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      <p
                        className={`text-11 mt-2 ${
                          msg.senderType === 'USER' ? 'text-white/70' : 'text-subtle'
                        }`}
                      >
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800">
                {isChatClosed ? (
                  <div className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-md sm:text-md text-muted flex items-center">
                    {t('support.closedHint')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FormInput
                      placeholder={t('support.replyPlaceholder')}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                      className="flex-1"
                    />
                    <IconButton
                      onClick={handleReply}
                      icon={<FiSend />}
                      size="md"
                      variant="primary"
                      loading={sendingReply}
                      disabled={!replyText.trim()}
                      ariaLabel={t('support.replyAria')}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-subtle p-10 text-center">
              <div>
                <FiMessageSquare className="text-4xl mx-auto mb-3" />
                <p>{t('support.emptyChatTitle')}</p>
                <p className="text-md mt-1">{t('support.emptyChatDescription')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
