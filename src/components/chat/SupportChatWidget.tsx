import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiPlus, FiSend, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ticketService from '@/apis/services/ticketService';
import type { SupportRealtimePayload, TicketResponse } from '@/types';
import { formatDateShort as formatDate } from '@/utils/format';
import { toast } from 'sonner';
import Button from '@/components/button/Button';
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
const NEW_TICKET_OPTION_VALUE = '__new__';
const getTicketKey = (ticket?: TicketResponse | null) => ticket?.ticketNumber || ticket?.id || null;
const getPayloadTicketKey = (payload?: SupportRealtimePayload | null) => payload?.ticketNumber || payload?.ticketId || null;

interface SupportChatWidgetProps {
  isOpen: boolean;
  isAnotherChatOpen?: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SupportChatWidget({
  isOpen,
  isAnotherChatOpen = false,
  onOpenChange,
}: SupportChatWidgetProps) {
  const { t } = useTranslation(['layout', 'common']);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const canDirectSupport = isAuthenticated && user?.role === 'USER';

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [isComposingNewConversation, setIsComposingNewConversation] = useState(false);
  const [draft, setDraft] = useState('');
  const supportAvatarUrl = '/admin.png';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedTicketIdRef = useRef<string | null>(null);
  const isOpenRef = useRef(false);
  const isComposingNewConversationRef = useRef(false);
  const draftInputRef = useRef<HTMLInputElement>(null);

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

      setSelectedTicketId((prevTicketId) => {
        if (isComposingNewConversationRef.current) {
          return null;
        }
        return prevTicketId && nextTickets.some((ticket) => getTicketKey(ticket) === prevTicketId)
          ? prevTicketId
          : (getTicketKey(nextTickets.find((ticket) => !CLOSED_STATUSES.has(ticket.status))) || getTicketKey(nextTickets[0]));
      });
      setTickets(nextTickets);
    } catch {
      if (!opts?.silent) setTickets([]);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [canDirectSupport]);

  const fetchSelectedTicket = useCallback(
    async (ticketId: string, opts?: { silent?: boolean }) => {
      if (!canDirectSupport) return;
      try {
        const res = await ticketService.getDetail(ticketId);
        setSelectedTicket(res.data);
      } catch {
        if (!opts?.silent) setSelectedTicket(null);
      }
    },
    [canDirectSupport],
  );

  const resolveStatusLabel = useCallback((status: string) => {
    const config = STATUS_CONFIG[status as StatusType];
    if (!config) return status;
    return config.labelKey
      ? t(config.labelKey, { ns: 'common', defaultValue: config.label })
      : config.label;
  }, [t]);

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
    selectedTicketIdRef.current = selectedTicketId;
  }, [selectedTicketId]);

  useEffect(() => {
    isComposingNewConversationRef.current = isComposingNewConversation;
  }, [isComposingNewConversation]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (!canDirectSupport) return;
      if (!SUPPORT_REALTIME_EVENTS.has(event.type)) {
        return;
      }

      const payload = (event.data || {}) as SupportRealtimePayload;
      const eventTicketId = getPayloadTicketKey(payload);
      const currentSelectedTicketId = selectedTicketIdRef.current;

      if (
        event.type === REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED
        && payload.senderType === 'ADMIN'
        && !isOpenRef.current
        && eventTicketId
        && eventTicketId !== currentSelectedTicketId
      ) {
        setUnreadCount((prev) => prev + 1);
      }

      fetchTickets({ silent: true });

      if (!currentSelectedTicketId && eventTicketId) {
        setSelectedTicketId(eventTicketId);
        return;
      }

      if (currentSelectedTicketId && eventTicketId && currentSelectedTicketId === eventTicketId) {
        fetchSelectedTicket(currentSelectedTicketId, { silent: true });
      }
    });

    return unsubscribe;
  }, [canDirectSupport, fetchSelectedTicket, fetchTickets]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [selectedTicket?.id, selectedTicket?.messages?.length, isOpen]);

  useEffect(() => {
    if (!isOpen || !isComposingNewConversation) return;
    const timer = window.setTimeout(() => {
      draftInputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isComposingNewConversation, isOpen]);

  const startNewConversation = useCallback(() => {
    if (!canDirectSupport || sending) return;
    setIsComposingNewConversation(true);
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setDraft('');
  }, [canDirectSupport, sending]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    if (!canDirectSupport) {
      toast.info(t('supportChat.loginRequiredToast', { ns: 'layout' }));
      navigate('/login');
      return;
    }

    setSending(true);
    try {
      if (selectedTicketId && selectedTicket && !CLOSED_STATUSES.has(selectedTicket.status) && !isComposingNewConversation) {
        const res = await ticketService.reply(selectedTicketId, { content });
        setSelectedTicket(res.data);
      } else {
        const res = await ticketService.create({
          subject: t('supportChat.createSubject', { ns: 'layout' }),
          content,
        });
        const created = res.data;
        setIsComposingNewConversation(false);
        setSelectedTicket(created);
        setSelectedTicketId(getTicketKey(created));
        toast.success(t('supportChat.createdToast', { ns: 'layout' }));
      }
      setDraft('');
      await fetchTickets({ silent: true });
    } catch {
      toast.error(t('supportChat.sendError', { ns: 'layout' }));
    } finally {
      setSending(false);
    }
  };

  const isClosed = Boolean(selectedTicket && CLOSED_STATUSES.has(selectedTicket.status));
  const ticketSelectValue = isComposingNewConversation ? NEW_TICKET_OPTION_VALUE : (selectedTicketId || '');
  const ticketSelectOptions = [
    { value: NEW_TICKET_OPTION_VALUE, label: t('supportChat.newConversationButton', { ns: 'layout' }) },
    ...tickets.map((ticket) => ({
      value: getTicketKey(ticket) || '',
      label: `${ticket.subject} – ${resolveStatusLabel(ticket.status)}`,
    })),
  ];

  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-[60] overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-700 ${
          isOpen || isAnotherChatOpen ? 'hidden' : ''
        }`}
        aria-label={t('supportChat.openAria', { ns: 'layout' })}
      >
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20 backdrop-blur">
          <img
            src={supportAvatarUrl}
            alt={t('supportChat.adminAvatarAlt', { ns: 'layout' })}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
          />
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-11 font-bold flex items-center justify-center">
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
            className="fixed bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-[70] right-3 bottom-16 w-[320px] max-w-[85vw] h-[min(75dvh,600px)] sm:right-6 sm:bottom-24 sm:w-[500px] sm:h-[720px] sm:max-w-[92vw] sm:max-h-[88vh]"
          >
            <div className="h-14 px-3 sm:px-4 flex items-center justify-between text-white bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-700">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-white/20 bg-white/10">
                  <img
                    src={supportAvatarUrl}
                    alt={t('supportChat.adminAvatarAlt', { ns: 'layout' })}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-md">{t('supportChat.title', { ns: 'layout' })}</h3>
                  <p className="text-11 text-white/80">{t('supportChat.subtitle', { ns: 'layout' })}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="px-2.5 sm:px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              {loading && tickets.length === 0 ? (
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                <div className="flex items-center gap-2">
                  {tickets.length > 0 ? (
                    <CustomSelect
                      value={ticketSelectValue}
                      onChange={(val) => {
                        if (val === NEW_TICKET_OPTION_VALUE) {
                          startNewConversation();
                          return;
                        }
                        setIsComposingNewConversation(false);
                        setSelectedTicketId(val || null);
                      }}
                      options={ticketSelectOptions}
                      className="min-w-0 flex-1"
                    />
                  ) : (
                    <p className="min-w-0 flex-1 text-sm text-muted">
                      {canDirectSupport
                        ? t('supportChat.noTickets', { ns: 'layout' })
                        : t('supportChat.loginToStart', { ns: 'layout' })}
                    </p>
                  )}
                  {canDirectSupport && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FiPlus className="text-base" />}
                      onClick={startNewConversation}
                      disabled={sending || isComposingNewConversation}
                      className="shrink-0 !rounded-lg !px-3"
                    >
                      {t('supportChat.newConversationShort', { ns: 'layout' })}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="px-2.5 sm:px-3 py-2 border-b border-slate-100 dark:border-slate-800 min-h-10 sm:min-h-11">
              {selectedTicket ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted truncate">{selectedTicket.ticketNumber}</p>
                  <StatusBadge status={selectedTicket.status} className="text-10" />
                </div>
              ) : (
                <p className="text-sm text-subtle">{t('supportChat.newSession', { ns: 'layout' })}</p>
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
                      className={`max-w-[92%] sm:max-w-[85%] px-3 py-2 rounded-2xl text-md ${
                        msg.senderType === 'USER'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-md'
                      }`}
                    >
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-10 mt-1 ${msg.senderType === 'USER' ? 'text-white/70' : 'text-subtle'}`}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full min-h-24 flex items-center justify-center text-center text-subtle text-md px-4">
                  <p>
                    {canDirectSupport
                      ? t('supportChat.emptyConversation', { ns: 'layout' })
                      : t('supportChat.emptyConversationGuest', { ns: 'layout' })}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800">
              {!canDirectSupport ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 text-white text-md font-semibold"
                >
                  {t('supportChat.loginButton', { ns: 'layout' })}
                </button>
              ) : isClosed ? (
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted text-md flex items-center">
                    {t('supportChat.closedHint', { ns: 'layout' })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FiPlus className="text-base" />}
                    onClick={startNewConversation}
                    disabled={sending}
                    className="shrink-0 !rounded-lg !px-3"
                  >
                    {t('supportChat.newConversationShort', { ns: 'layout' })}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={draftInputRef}
                    className="flex-1 h-9 sm:h-10 px-3 rounded-lg text-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    placeholder={t('supportChat.inputPlaceholder', { ns: 'layout' })}
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
                    ariaLabel={t('supportChat.sendAria', { ns: 'layout' })}
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
