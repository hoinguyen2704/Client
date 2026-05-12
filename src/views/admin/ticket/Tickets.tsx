import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TFunction } from 'i18next';
import { FiCalendar, FiCheck, FiChevronDown, FiCopy, FiMessageCircle, FiUsers } from 'react-icons/fi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import adminTicketService from '@/apis/services/adminTicketService';
import { Button, CustomSelect, Pagination } from '@/components';
import TicketListItem from '@/components/ticket/TicketListItem';
import { getTicketFilterOptions, getTicketStatusOptions } from '@/constants/ticketConstants';
import type { SupportRealtimePayload, TicketResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { formatDateShort as formatDate } from '@/utils/format';
import { REALTIME_EVENT_TYPES } from '@/constants/realtimeConstants';
import { onRealtimeEvent } from '@/realtime/realtimeBus';

const SUPPORT_REALTIME_EVENTS = new Set<string>([
  REALTIME_EVENT_TYPES.SUPPORT_TICKET_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_MESSAGE_CREATED,
  REALTIME_EVENT_TYPES.SUPPORT_STATUS_UPDATED,
]);

type TicketGroupMode = 'NONE' | 'DATE' | 'CUSTOMER';

interface TicketGroupSection {
  key: string;
  title: string;
  subtitle?: string;
  tickets: TicketResponse[];
}

function formatDateGroupLabel(
  rawDate: string,
  formatter: Intl.DateTimeFormat,
  t: TFunction,
): string {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return t('tickets.dateUnknown');
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear();

  return isToday
    ? t('tickets.todayLabel', { date: formatter.format(date) })
    : formatter.format(date);
}

function formatCustomerGroupLabel(ticket: TicketResponse, t: TFunction): string {
  const userName = ticket.userName?.trim();
  const userEmail = ticket.userEmail?.trim();

  if (userName && userEmail) {
    return `${userName} · ${userEmail}`;
  }
  if (userName) {
    return userName;
  }
  if (userEmail) {
    return userEmail;
  }

  return t('tickets.unknownCustomer');
}

function getCustomerGroupSubtitle(ticket: TicketResponse, t: TFunction): string | undefined {
  const userName = ticket.userName?.trim();
  const userEmail = ticket.userEmail?.trim();

  if (userName && userEmail) {
    return userEmail;
  }

  if (userEmail) {
    return t('tickets.customerGroup');
  }

  if (userName) {
    return t('tickets.identifiedCustomer');
  }

  return t('tickets.missingAccountInfo');
}

function buildTicketSections(
  tickets: TicketResponse[],
  groupMode: TicketGroupMode,
  formatter: Intl.DateTimeFormat,
  t: TFunction,
): TicketGroupSection[] {
  if (groupMode === 'NONE') {
    return [{ key: 'all-tickets', title: t('tickets.allTickets'), tickets }];
  }

  const sections = new Map<string, TicketGroupSection>();

  tickets.forEach((ticket) => {
    const key =
      groupMode === 'DATE'
        ? formatDateGroupLabel(ticket.createdAt, formatter, t)
        : (ticket.userId || ticket.userEmail || ticket.userName || 'guest').toLowerCase();
    const title = groupMode === 'DATE'
      ? formatDateGroupLabel(ticket.createdAt, formatter, t)
      : formatCustomerGroupLabel(ticket, t);
    const subtitle = groupMode === 'DATE' ? t('tickets.groupByCreatedDate') : getCustomerGroupSubtitle(ticket, t);

    if (!sections.has(key)) {
      sections.set(key, { key, title, subtitle, tickets: [] });
    }

    sections.get(key)?.tickets.push(ticket);
  });

  return Array.from(sections.values());
}

export default function Tickets() {
  const { t, i18n } = useTranslation(['adminSupport', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [groupMode, setGroupMode] = useState<TicketGroupMode>('NONE');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(() => {
    const pageParam = Number(searchParams.get('page') || '1');
    return Number.isFinite(pageParam) && pageParam > 0 ? Math.trunc(pageParam) : 1;
  });
  const [pageData, setPageData] = useState<PageResponse<TicketResponse> | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const requestedTicketId = searchParams.get('ticketId');
  const dateGroupFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [i18n.language],
  );
  const ticketGroupOptions = useMemo(
    () => [
      { value: 'NONE', label: t('tickets.groupOptions.none') },
      { value: 'DATE', label: t('tickets.groupOptions.date') },
      { value: 'CUSTOMER', label: t('tickets.groupOptions.customer') },
    ],
    [t],
  );
  const ticketSections = useMemo(
    () => buildTicketSections(tickets, groupMode, dateGroupFormatter, t),
    [dateGroupFormatter, groupMode, t, tickets],
  );

  useEffect(() => {
    const currentPageParam = searchParams.get('page');
    const expectedPageParam = page > 1 ? String(page) : null;
    if (currentPageParam === expectedPageParam || (!currentPageParam && page === 1)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    if (expectedPageParam) {
      nextSearchParams.set('page', expectedPageParam);
    } else {
      nextSearchParams.delete('page');
    }
    setSearchParams(nextSearchParams, { replace: true });
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    if (groupMode === 'NONE') {
      setExpandedSections({});
      return;
    }

    setExpandedSections((prev) => {
      const next: Record<string, boolean> = {};

      ticketSections.forEach((section) => {
        const stateKey = `${groupMode}:${section.key}`;
        next[stateKey] = prev[stateKey] ?? true;
      });

      return next;
    });
  }, [groupMode, ticketSections]);

  useLayoutEffect(() => {
    if (!selectedTicket?.id || !messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [selectedTicket?.id, selectedTicket?.messages?.length]);

  useEffect(() => () => {
    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current);
    }
  }, []);

  const fetchTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await adminTicketService.getAll({ status: statusFilter || undefined, page, size: PAGE_SIZE.LARGE });
      const nextTickets = res.data.data || [];
      setPageData(res.data);
      setTickets(nextTickets);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      toast.error(t('tickets.toasts.loadFailed'));
    }
    finally { setLoading(false); }
  }, [page, statusFilter, t]);

  const syncSelectedTicketParam = useCallback((ticketId: string | null) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (ticketId) {
      nextSearchParams.set('ticketId', ticketId);
    } else {
      nextSearchParams.delete('ticketId');
    }
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchSelectedTicket = useCallback(async (ticketId: string, opts?: { silent?: boolean }) => {
    try {
      const res = await adminTicketService.getById(ticketId);
      setSelectedTicket(res.data);
    } catch {
      if (!opts?.silent) toast.error(t('tickets.toasts.loadDetailFailed'));

      if (requestedTicketId && requestedTicketId === ticketId) {
        const fallbackTicket = tickets[0] || null;
        if (fallbackTicket) {
          syncSelectedTicketParam(fallbackTicket.id);
        } else {
          syncSelectedTicketParam(null);
          setSelectedTicket(null);
        }
      }
    }
  }, [requestedTicketId, syncSelectedTicketParam, t, tickets]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (!tickets.length && requestedTicketId) {
      if (selectedTicket?.id === requestedTicketId) {
        return;
      }

      void fetchSelectedTicket(requestedTicketId, { silent: true });
      return;
    }

    if (!tickets.length) {
      setSelectedTicket(null);
      return;
    }

    if (requestedTicketId) {
      if (selectedTicket?.id === requestedTicketId) {
        return;
      }

      const requestedTicket = tickets.find((ticket) => ticket.id === requestedTicketId);
      if (requestedTicket) {
        void fetchSelectedTicket(requestedTicket.id, { silent: true });
        return;
      }

      void fetchSelectedTicket(requestedTicketId, { silent: true });
      return;
    }

    if (selectedTicket?.id && tickets.some((ticket) => ticket.id === selectedTicket.id)) {
      return;
    }

    void fetchSelectedTicket(tickets[0].id, { silent: true });
    syncSelectedTicketParam(tickets[0].id);
  }, [fetchSelectedTicket, requestedTicketId, selectedTicket?.id, syncSelectedTicketParam, tickets]);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (!SUPPORT_REALTIME_EVENTS.has(event.type)) {
        return;
      }

      const payload = (event.data || {}) as SupportRealtimePayload;
      const eventTicketId = payload.ticketId || null;

      fetchTickets({ silent: true });
      if (selectedTicket?.id && eventTicketId && selectedTicket.id === eventTicketId) {
        fetchSelectedTicket(selectedTicket.id, { silent: true });
      }
    });

    return unsubscribe;
  }, [fetchTickets, fetchSelectedTicket, selectedTicket?.id]);

  const handleSelectTicket = async (
    ticket: TicketResponse,
    opts?: { silent?: boolean; syncQuery?: boolean },
  ) => {
    if (opts?.syncQuery !== false) {
      syncSelectedTicketParam(ticket.id);
    }

    try {
      const res = await adminTicketService.getById(ticket.id);
      setSelectedTicket(res.data);
    } catch {
      setSelectedTicket(ticket);
      if (!opts?.silent) {
        toast.error(t('tickets.toasts.loadDetailFailed'));
      }
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const res = await adminTicketService.reply(selectedTicket.id, { content: replyText });
      setSelectedTicket(res.data);
      setReplyText('');
      await fetchTickets({ silent: true });
    } catch (err) {
      console.error('Reply failed:', err);
      toast.error(t('tickets.toasts.replyFailed'));
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await adminTicketService.updateStatus(id, status);
      setSelectedTicket(res.data);
      await fetchTickets({ silent: true });
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error(t('tickets.toasts.statusFailed'));
    }
  };

  const handleCopyCustomerEmail = useCallback(async (email?: string | null) => {
    const normalizedEmail = email?.trim();
    if (!normalizedEmail) {
      toast.error(t('tickets.toasts.copyEmailMissing'));
      return;
    }

    try {
      await navigator.clipboard.writeText(normalizedEmail);
      setCopiedEmail(normalizedEmail);
      toast.success(t('tickets.toasts.copyEmailSuccess'));

      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopiedEmail(null);
        copyResetTimerRef.current = null;
      }, 1800);
    } catch {
      toast.error(t('tickets.toasts.copyEmailFailed'));
    }
  }, [t]);

  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('tickets.title')}</h1>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <CustomSelect
            value={groupMode}
            onChange={(val) => setGroupMode(val as TicketGroupMode)}
            options={ticketGroupOptions.map((option) => ({ ...option }))}
            className="w-full sm:w-44 z-20"
          />
          <CustomSelect value={statusFilter} onChange={(val) => { setStatusFilter(val); setPage(1); }}
            options={getTicketFilterOptions(t)} className="w-full sm:w-48 z-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 flex flex-col h-[46dvh] min-h-[300px] sm:min-h-[340px] lg:h-[calc(100dvh-420px)] lg:min-h-[500px] overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" /><div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></div>
              ))
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-subtle">{t('tickets.empty')}</div>
            ) : (
              ticketSections.map((section) => {
                const stateKey = `${groupMode}:${section.key}`;
                const isExpanded = expandedSections[stateKey] ?? true;

                return (
                  <section key={section.key} className="mb-3 last:mb-0">
                    {groupMode !== 'NONE' && (
                      <Button
                        type="button"
                        variant="ghost"
                        fullWidth
                        onClick={() => toggleSection(stateKey)}
                        ariaLabel={t(`tickets.sectionToggle.${isExpanded ? 'collapse' : 'expand'}`, { title: section.title })}
                        className="group sticky top-0 z-10 !h-auto !justify-start rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm backdrop-blur transition-all hover:border-blue-200 hover:bg-blue-50/80 dark:border-slate-700 dark:bg-slate-900/95 dark:hover:border-blue-500/40 dark:hover:bg-slate-900"
                      >
                        <div className="flex w-full items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-muted shadow-sm ring-1 ring-slate-200 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-100 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300 dark:group-hover:ring-blue-500/30">
                            {groupMode === 'DATE' ? <FiCalendar className="text-base" /> : <FiUsers className="text-base" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
                              {section.title}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-muted">
                              {section.subtitle}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-muted shadow-sm ring-1 ring-slate-200 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:ring-blue-100 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300 dark:group-hover:ring-blue-500/30">
                              {t('tickets.requestsCount', { count: section.tickets.length })}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-muted shadow-sm ring-1 ring-slate-200 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:ring-blue-100 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300 dark:group-hover:ring-blue-500/30">
                              <FiChevronDown
                                className={`text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                  }`}
                              />
                            </span>
                          </div>
                        </div>
                      </Button>
                    )}
                    {isExpanded && (
                      <div className={`space-y-1 ${groupMode !== 'NONE' ? 'mt-2' : ''}`}>
                        {section.tickets.map((ticket) => (
                          <TicketListItem
                            key={ticket.id}
                            ticket={ticket}
                            isSelected={selectedTicket?.id === ticket.id}
                            onClick={handleSelectTicket}
                            showUserName={true}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
          {pageData && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <Pagination variant="admin"
                currentPage={page}
                totalPages={pageData.lastPage}
                totalItems={pageData.total}
                perPage={PAGE_SIZE.LARGE}
                label={t('tickets.paginationLabel')}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[52dvh] min-h-[320px] sm:min-h-[360px] lg:h-[calc(100dvh-420px)] lg:min-h-[500px]">
          {selectedTicket ? (
            <>
              <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold">{selectedTicket.subject}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-md text-muted">
                      <span>{selectedTicket.userName} ({selectedTicket.userEmail})</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCustomerEmail(selectedTicket.userEmail)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        aria-label={t('tickets.copyEmailAria')}
                        title={t('tickets.copyEmailTitle')}
                      >
                        {copiedEmail === selectedTicket.userEmail ? <FiCheck className="text-sm" /> : <FiCopy className="text-sm" />}
                        {copiedEmail === selectedTicket.userEmail ? t('tickets.copied') : t('tickets.copyEmail')}
                      </button>
                    </div>
                  </div>
                  <CustomSelect value={selectedTicket.status} onChange={(val) => handleStatusChange(selectedTicket.id, val)}
                    options={getTicketStatusOptions(t)} className="w-full sm:w-36 z-10" />
                </div>
              </div>
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
                {selectedTicket.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-md sm:text-base ${msg.senderType === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                      <p>{msg.content}</p>
                      <p className={`text-10 mt-1 ${msg.senderType === 'ADMIN' ? 'text-blue-200' : 'text-subtle'}`}>{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                <input type="text" placeholder={t('tickets.replyPlaceholder')} value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  className="flex-1 h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-md sm:text-base" />
                <Button onClick={handleReply} size="md" icon={<FiMessageCircle />} className="w-full sm:w-auto">
                  {t('tickets.send')}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-subtle p-12">{t('tickets.emptyDetail')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
