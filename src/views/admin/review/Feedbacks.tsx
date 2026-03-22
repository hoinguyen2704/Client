import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiStar, FiMessageCircle, FiDownload } from 'react-icons/fi';
import adminFeedbackService from '@/apis/services/adminFeedbackService';
import type { FeedbackResponse, PageResponse } from '@/types';

export default function Feedbacks() {
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<FeedbackResponse> | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFeedbackService.getAll({ status: statusFilter || undefined, page, size: 20 });
      setPageData(res.data);
      setReviews(res.data.data || []);
    } catch (err) { console.error('Failed to fetch feedbacks:', err); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatusChange = async (id: string, status: string) => {
    try { await adminFeedbackService.updateStatus(id, status); fetchReviews(); }
    catch (err) { console.error('Update failed:', err); }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await adminFeedbackService.reply(id, replyText);
      setReplyId(null); setReplyText('');
      fetchReviews();
    } catch (err) { console.error('Reply failed:', err); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 font-medium outline-none">
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
              <div className="flex gap-4"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" /></div></div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800">Không có đánh giá nào</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
                  {review.userAvatar ? <img src={review.userAvatar} className="w-10 h-10 rounded-full object-cover" /> : review.userName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <span className="font-bold">{review.userName}</span>
                      <span className="text-slate-400 text-sm ml-2">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">SP: <span className="font-medium text-slate-700 dark:text-slate-300">{review.productName}</span></p>
                  <p className="text-slate-700 dark:text-slate-300">{review.content}</p>

                  {review.adminReply && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm">
                      <span className="font-bold text-blue-600">Admin:</span> {review.adminReply}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <select value={review.status} onChange={(e) => handleStatusChange(review.id, e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer">
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="APPROVED">Đã duyệt</option>
                      <option value="REJECTED">Từ chối</option>
                    </select>
                    {!review.adminReply && (
                      <button onClick={() => setReplyId(replyId === review.id ? null : review.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 transition-colors flex items-center gap-1">
                        <FiMessageCircle /> Trả lời
                      </button>
                    )}
                  </div>

                  {replyId === review.id && (
                    <div className="mt-3 flex gap-2">
                      <input type="text" placeholder="Nhập nội dung trả lời..." value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm" />
                      <button onClick={() => handleReply(review.id)}
                        className="h-10 px-4 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">Gửi</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pageData && pageData.lastPage > 1 && (
        <div className="flex justify-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&lt;</button>
          {Array.from({ length: Math.min(pageData.lastPage, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${p === page ? 'bg-purple-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pageData.lastPage, p + 1))} disabled={page === pageData.lastPage} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&gt;</button>
        </div>
      )}
    </div>
  );
}
