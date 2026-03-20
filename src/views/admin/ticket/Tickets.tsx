import { useState } from 'react';
import { FiMessageSquare, FiPaperclip, FiSend, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { mockTickets, mockChatHistory } from '@/__mocks__/mockAdmin';

export default function Tickets() {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiAlertCircle /> Mới</span>;
      case 'in_progress': return <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiClock /> Đang xử lý</span>;
      case 'replied': return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiCheckCircle /> Đã trả lời</span>;
      case 'closed': return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiXCircle /> Đóng</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200">High</span>;
      case 'medium': return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold border border-yellow-200">Medium</span>;
      case 'low': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-200">Low</span>;
      default: return null;
    }
  };

  const closeTicket = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'closed' } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-2xl font-bold">Hỗ trợ khách hàng (Tickets)</h1>
        <div className="flex gap-2">
          <select className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="">Tất cả mức độ</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Ticket List */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col ${selectedTicket ? 'hidden lg:flex lg:w-1/3' : 'w-full'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <input type="text" placeholder="Tìm kiếm ticket..." className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-xl cursor-pointer transition-colors border ${selectedTicket?.id === ticket.id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-slate-500">{ticket.id}</span>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ticket.priority)}
                    <span className="text-xs text-slate-400">{ticket.date.split(' ')[0]}</span>
                  </div>
                </div>
                <h4 className="font-bold text-sm mb-1 truncate">{ticket.subject}</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 truncate pr-2">{ticket.customer}</span>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat / Reply Thread */}
        {selectedTicket ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col flex-1 min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{selectedTicket.subject}</h3>
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <p className="text-sm text-slate-500">{selectedTicket.id} • {selectedTicket.customer} • Tạo lúc: {selectedTicket.date}</p>
              </div>
              <div className="flex gap-2">
                {selectedTicket.status !== 'closed' && (
                  <button 
                    onClick={() => closeTicket(selectedTicket.id)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    Đóng Ticket
                  </button>
                )}
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiXCircle className="text-xl" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
              {mockChatHistory.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">{msg.name}</span>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.sender === 'admin' 
                      ? 'bg-purple-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                    {msg.image && (
                      <img src={msg.image} alt="Attachment" className="mt-3 rounded-lg max-w-full h-auto border border-black/10 dark:border-white/10" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            {selectedTicket.status !== 'closed' ? (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-end gap-2">
                  <button className="p-3 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors shrink-0">
                    <FiPaperclip className="text-xl" />
                  </button>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung trả lời..."
                    className="flex-1 max-h-32 min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                    rows={1}
                  ></textarea>
                  <button className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shrink-0">
                    <FiSend className="text-xl" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center text-sm text-slate-500 shrink-0">
                Ticket này đã được đóng. Không thể gửi thêm tin nhắn.
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 flex-col gap-4">
            <FiMessageSquare className="text-6xl text-slate-200 dark:text-slate-700" />
            <p>Chọn một ticket để xem chi tiết và trả lời</p>
          </div>
        )}
      </div>
    </div>
  );
}
