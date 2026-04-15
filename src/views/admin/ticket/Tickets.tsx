import { useState, useEffect, useCallback, useRef } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import adminTicketService from '@/apis/services/adminTicketService';
import { Button, CustomSelect, Pagination } from '@/components';
import TicketListItem from '@/components/ticket/TicketListItem';
import { TICKET_STATUS_OPTIONS, TICKET_FILTER_OPTIONS } from '@/constants/ticketConstants';
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

export default function Tickets() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<TicketResponse> | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await adminTicketService.getAll({ status: statusFilter || undefined, page, size: PAGE_SIZE.LARGE });
      const nextTickets = res.data.data || [];
      setPageData(res.data);
      setTickets(nextTickets);
    } catch (err) { console.error('Failed to fetch tickets:', err); 
      toast.error('Tải danh sách hỗ trợ thất bại!'); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  const fetchSelectedTicket = useCallback(async (opts?: { silent?: boolean }) => {
    if (!selectedTicket?.id) return;
    try {
      const res = await adminTicketService.getById(selectedTicket.id);
      setSelectedTicket(res.data);
    } catch {
      if (!opts?.silent) toast.error('Không thể tải chi tiết ticket');
    }
  }, [selectedTicket?.id]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (!selectedTicket?.id) return;
    fetchSelectedTicket();
  }, [selectedTicket?.id, fetchSelectedTicket]);

  useEffect(() => {
    const unsubscribe = onRealtimeEvent((event) => {
      if (!SUPPORT_REALTIME_EVENTS.has(event.type)) {
        return;
      }

      const payload = (event.data || {}) as SupportRealtimePayload;
      const eventTicketId = payload.ticketId || null;

      fetchTickets({ silent: true });
      if (selectedTicket?.id && eventTicketId && selectedTicket.id === eventTicketId) {
        fetchSelectedTicket({ silent: true });
      }
    });

    return unsubscribe;
  }, [fetchTickets, fetchSelectedTicket, selectedTicket?.id]);

  const handleSelectTicket = async (ticket: TicketResponse) => {
    try {
      const res = await adminTicketService.getById(ticket.id);
      setSelectedTicket(res.data);
    } catch {
      setSelectedTicket(ticket);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const res = await adminTicketService.reply(selectedTicket.id, { content: replyText });
      setSelectedTicket(res.data);
      setReplyText('');
      await fetchTickets({ silent: true });
    } catch (err) { console.error('Reply failed:', err); 
      toast.error('Gửi phản hồi thất bại!'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await adminTicketService.updateStatus(id, status);
      setSelectedTicket(res.data);
      await fetchTickets({ silent: true });
    } catch (err) { console.error('Status update failed:', err); 
      toast.error('Cập nhật trạng thái thất bại!'); }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý yêu cầu hỗ trợ</h1>
        <CustomSelect value={statusFilter} onChange={(val) => { setStatusFilter(val); setPage(1); }}
          options={TICKET_FILTER_OPTIONS} className="w-full sm:w-48 z-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 flex flex-col h-[46dvh] min-h-[300px] sm:min-h-[340px] lg:h-[calc(100dvh-420px)] lg:min-h-[500px] overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto min-h-0">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" /><div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></div>
              ))
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Không có ticket nào</div>
            ) : (
              tickets.map((ticket) => (
                <TicketListItem
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onClick={handleSelectTicket}
                  showUserName={true}
                />
              ))
            )}
          </div>
          {pageData && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <Pagination variant="admin"
                currentPage={page}
                totalPages={pageData.lastPage}
                totalItems={pageData.total}
                perPage={PAGE_SIZE.LARGE}
                label="yêu cầu"
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
                    <p className="text-md text-slate-500 mt-1">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                  </div>
                  <CustomSelect value={selectedTicket.status} onChange={(val) => handleStatusChange(selectedTicket.id, val)}
                    options={TICKET_STATUS_OPTIONS} className="w-full sm:w-36 z-10" />
                </div>
              </div>
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
                {selectedTicket.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-md sm:text-base ${
                      msg.senderType === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-10 mt-1 ${msg.senderType === 'ADMIN' ? 'text-purple-200' : 'text-slate-400'}`}>{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                <input type="text" placeholder="Nhập câu trả lời..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  className="flex-1 h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-md sm:text-base" />
                <Button onClick={handleReply} size="md" icon={<FiMessageCircle />} className="w-full sm:w-auto">
                Gửi
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-12">Chọn một ticket để xem chi tiết</div>
          )}
        </div>
      </div>
    </div>
  );
}
