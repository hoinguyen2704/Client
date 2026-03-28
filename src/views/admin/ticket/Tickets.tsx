import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiMessageCircle } from 'react-icons/fi';
import adminTicketService from '@/apis/services/adminTicketService';
import CustomSelect from '@/components/ui/CustomSelect';
import { TICKET_STATUS_OPTIONS, TICKET_FILTER_OPTIONS } from '@/constants/ticketConstants';
import type { TicketResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';

export default function Tickets() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<TicketResponse> | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminTicketService.getAll({ status: statusFilter || undefined, page, size: PAGE_SIZE.LARGE });
      setPageData(res.data); setTickets(res.data.data || []);
    } catch (err) { console.error('Failed to fetch tickets:', err); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSelectTicket = async (ticket: TicketResponse) => {
    try {
      const res = await adminTicketService.getById(ticket.id);
      setSelectedTicket(res.data);
    } catch { setSelectedTicket(ticket); }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const res = await adminTicketService.reply(selectedTicket.id, { content: replyText });
      setSelectedTicket(res.data);
      setReplyText(''); fetchTickets();
    } catch (err) { console.error('Reply failed:', err); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await adminTicketService.updateStatus(id, status); fetchTickets(); }
    catch (err) { console.error('Status update failed:', err); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý yêu cầu hỗ trợ</h1>
        <CustomSelect value={statusFilter} onChange={(val) => { setStatusFilter(val); setPage(1); }}
          options={TICKET_FILTER_OPTIONS} className="w-full sm:w-48 z-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" /><div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></div>
              ))
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Không có ticket nào</div>
            ) : (
              tickets.map((ticket) => (
                <button key={ticket.id} onClick={() => handleSelectTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-600' : ''}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-slate-500 mt-1">{ticket.userName} • {formatDate(ticket.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-600' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                    }`}>{ticket.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold">{selectedTicket.subject}</h2>
                    <p className="text-sm text-slate-500 mt-1">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                  </div>
                  <CustomSelect value={selectedTicket.status} onChange={(val) => handleStatusChange(selectedTicket.id, val)}
                    options={TICKET_STATUS_OPTIONS} className="w-36 z-10" />
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto max-h-[400px] space-y-4">
                {selectedTicket.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.senderType === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.senderType === 'ADMIN' ? 'text-purple-200' : 'text-slate-400'}`}>{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input type="text" placeholder="Nhập câu trả lời..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={handleReply} className="h-12 px-6 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <FiMessageCircle /> Gửi
                </button>
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
