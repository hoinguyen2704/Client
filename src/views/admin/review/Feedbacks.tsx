import { useState, useEffect, useCallback, useRef } from 'react';
import { FiDownload, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import adminFeedbackService from '@/apis/services/adminFeedbackService';
import { Button, CustomSelect, Pagination, StarRating, UserAvatar } from '@/components';
import { getFeedbackFilterOptions, getFeedbackStatusOptions } from '@/constants/feedbackConstants';
import type { FeedbackResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { downloadBlob } from '@/utils/download';
import { getApiErrorMessage } from '@/utils/error';
import { formatDate } from '@/utils/format';

export default function Feedbacks() {
  const { t } = useTranslation(['adminSales', 'common']);
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<FeedbackResponse> | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const replyRef = useRef<HTMLInputElement>(null);

  const fetchReviews = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await adminFeedbackService.getAll({ status: statusFilter || undefined, page, size: PAGE_SIZE.LARGE });
      setPageData(res.data);
      setReviews(res.data.data || []);
    } catch (err) { console.error('Failed to fetch feedbacks:', err); 
      toast.error(t('feedbacks.toasts.loadFailed')); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatusChange = async (id: string, status: string) => {
    try { await adminFeedbackService.updateStatus(id, status); fetchReviews({ silent: true }); }
    catch (err) { console.error('Update failed:', err); 
      toast.error(t('feedbacks.toasts.statusFailed')); }
  };

  const handleReply = async (id: string) => {
    const text = replyRef.current?.value?.trim();
    if (!text) return;
    try {
      await adminFeedbackService.reply(id, text);
      setReplyId(null);
      fetchReviews({ silent: true });
    } catch (err) { console.error('Reply failed:', err);
       toast.error(t('feedbacks.toasts.replyFailed')); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await adminFeedbackService.export({
        status: statusFilter || undefined,
      });
      downloadBlob(blob, `feedbacks_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(t('feedbacks.toasts.exportSuccess'));
    } catch (err) {
      console.error('Export failed:', err);
      toast.error(getApiErrorMessage(err, t, 'feedbacks.toasts.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('feedbacks.title')}</h1>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            variant="success"
            size="md"
            icon={<FiDownload />}
            loading={isExporting}
            className="w-full sm:w-auto"
          >
            {t('feedbacks.export')}
          </Button>
          <CustomSelect value={statusFilter} onChange={(val) => { setStatusFilter(val); setPage(1); }}
            options={getFeedbackFilterOptions(t)} className="w-full sm:w-48 z-20 shrink-0" />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
              <div className="flex gap-4"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" /></div></div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-subtle border border-slate-100 dark:border-slate-800">{t('feedbacks.empty')}</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 sm:gap-4">
                <UserAvatar name={review.userName} src={review.userAvatar} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                    <div>
                      <span className="font-bold">{review.userName}</span>
                      <span className="text-subtle text-md ml-2">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarRating value={review.rating} onChange={() => {}} readOnly size="sm" showLabel={false} />
                    </div>
                  </div>
                  <p className="text-md text-muted mb-1">
                    {t('feedbacks.productLabel')}: <span className="font-medium text-body">{review.productName}</span>
                  </p>
                  <p className="text-body">{review.content}</p>

                  {review.adminReply && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-md">
                      <span className="font-bold text-blue-600">{t('feedbacks.adminLabel')}:</span> {review.adminReply}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <CustomSelect value={review.status} onChange={(val) => handleStatusChange(review.id, val)}
                      options={getFeedbackStatusOptions(t)} className="w-full sm:w-36 z-10" />
                    {!review.adminReply && (
                      <Button onClick={() => setReplyId(replyId === review.id ? null : review.id)}
                        variant="ghost" size="sm" icon={<FiMessageCircle />}
                        className="text-blue-600">
                        {t('feedbacks.reply')}
                      </Button>
                    )}
                  </div>

                  {replyId === review.id && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input type="text" placeholder={t('feedbacks.replyPlaceholder')}
                        ref={replyRef}
                        defaultValue=""
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleReply(review.id); }}
                        className="flex-1 h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none text-md" />
                      <Button onClick={() => handleReply(review.id)} size="sm" className="w-full sm:w-auto">{t('feedbacks.send')}</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pageData && (
        <Pagination variant="admin"
          currentPage={page}
          totalPages={pageData.lastPage}
          totalItems={pageData.total}
          perPage={PAGE_SIZE.LARGE}
          label={t('feedbacks.pagination')}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
