import { useState, useEffect } from 'react';
import { FiMessageSquare, FiPlus, FiChevronRight, FiX, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import ticketService from '@/apis/services/ticketService';
import type { TicketResponse } from '@/types';

const statusMap: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Mở', color: 'bg-blue-100 text-blue-600' },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-600' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-600' },
  CLOSED: { label: 'Đã đóng', color: 'bg-slate-100 text-slate-600' },
};

export default function Support() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try { const res = await ticketService.getMyTickets(1, 20); setTickets(res.data?.data || []); }
    catch { setTickets([]); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newSubject.trim() || !newContent.trim()) return;
    try {
      await ticketService.create({ subject: newSubject, content: newContent });
      setShowCreate(false); setNewSubject(''); setNewContent('');
      fetchTickets();
    } catch { alert('Gửi yêu cầu thất bại!'); }
  };

  const handleViewDetail = async (id: string) => {
    try { const res = await ticketService.getDetail(id); setSelectedTicket(res.data); }
    catch { alert('Không tải được chi tiết'); }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const res = await ticketService.reply(selectedTicket.id, { content: replyText });
      setSelectedTicket(res.data);
      setReplyText('');
    } catch { alert('Gửi phản hồi thất bại!'); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hỗ trợ</h1>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-md flex items-center gap-2"><FiPlus /> Tạo yêu cầu</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <FiMessageSquare className="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chưa có yêu cầu hỗ trợ</h3>
          <p className="text-slate-500">Gửi yêu cầu nếu bạn cần trợ giúp.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} onClick={() => handleViewDetail(t.id)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md cursor-pointer transition-all flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold truncate">{t.subject}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusMap[t.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                    {statusMap[t.status]?.label || t.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{t.ticketNumber} • {formatDate(t.createdAt)} • {t.messages?.length || 0} tin nhắn</p>
              </div>
              <FiChevronRight className="text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Tạo yêu cầu hỗ trợ</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><FiX /></button>
              </div>
              <div className="p-6 space-y-4">
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="Tiêu đề" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                <textarea className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none" placeholder="Mô tả chi tiết vấn đề..." value={newContent} onChange={(e) => setNewContent(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
                <button onClick={handleCreate} className="btn btn-primary btn-md">Gửi</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h3 className="font-bold">{selectedTicket.subject}</h3>
                  <span className="text-xs text-slate-500">{selectedTicket.ticketNumber}</span>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><FiX /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(selectedTicket.messages || []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.senderType === 'USER' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-xs mt-1 block ${msg.senderType === 'USER' ? 'text-white/60' : 'text-slate-400'}`}>{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex gap-2">
                    <input className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="Nhập phản hồi..."
                      value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleReply()} />
                    <button onClick={handleReply} className="btn btn-primary btn-md"><FiSend /></button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
