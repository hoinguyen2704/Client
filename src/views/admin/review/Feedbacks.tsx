import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { RefObject } from 'react';
import { FiDownload, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import adminFeedbackService from '@/apis/services/adminFeedbackService';
import { Button, CustomSelect, FeedbackImageGrid, Pagination, StarRating, UserAvatar } from '@/components';
import { getFeedbackFilterOptions, getFeedbackStatusOptions } from '@/constants/feedbackConstants';
import type { FeedbackResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { useAsyncExportJob, usePageQueryParam } from '@/hooks';
import { parseFeedbackImageUrls } from '@/utils/feedback';
import { formatDate } from '@/utils/format';

const ADMIN_FEEDBACK_PAGE_SIZE = PAGE_SIZE.MEDIUM;

interface FeedbackCardProps {
  review: FeedbackResponse;
  statusOptions: ReturnType<typeof getFeedbackStatusOptions>;
  isReplying: boolean;
  replyInputRef: RefObject<HTMLInputElement | null>;
  reviewImageAlt: string;
  adminLabel: string;
  productLabel: string;
  replyLabel: string;
  replyPlaceholder: string;
  sendLabel: string;
  onStatusChange: (id: string, status: string) => void;
  onToggleReply: (id: string) => void;
  onSubmitReply: (id: string) => void;
}

const FeedbackCard = memo(function FeedbackCard({
  review,
  statusOptions,
  isReplying,
  replyInputRef,
  reviewImageAlt,
  adminLabel,
  productLabel,
  replyLabel,
  replyPlaceholder,
  sendLabel,
  onStatusChange,
  onToggleReply,
  onSubmitReply,
}: FeedbackCardProps) {
  const imageUrls = useMemo(
    () => parseFeedbackImageUrls(review.imagesJson),
    [review.imagesJson],
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
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
            {productLabel}: <span className="font-medium text-body">{review.productName}</span>
          </p>
          <p className="text-body">{review.content}</p>
          <FeedbackImageGrid
            imageUrls={imageUrls}
            altPrefix={reviewImageAlt}
            className="mt-3"
          />

          {review.adminReply && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-md">
              <span className="font-bold text-blue-600">{adminLabel}:</span> {review.adminReply}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <CustomSelect
              value={review.status}
              onChange={(val) => onStatusChange(review.id, val)}
              options={statusOptions}
              className="w-full sm:w-36 z-10"
            />
            {!review.adminReply && (
              <Button
                onClick={() => onToggleReply(review.id)}
                variant="ghost"
                size="sm"
                icon={<FiMessageCircle />}
                className="text-blue-600"
              >
                {replyLabel}
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={replyPlaceholder}
                ref={replyInputRef}
                defaultValue=""
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') onSubmitReply(review.id); }}
                className="flex-1 h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none text-md"
              />
              <Button onClick={() => onSubmitReply(review.id)} size="sm" className="w-full sm:w-auto">
                {sendLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function Feedbacks() {
  const { t } = useTranslation(['adminSales', 'common']);
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { isExporting, startExport } = useAsyncExportJob();
  const [statusFilter, setStatusFilter] = useState('');
  const { initialPage, syncPage } = usePageQueryParam();
  const [page, setPage] = useState(initialPage);
  const [pageData, setPageData] = useState<PageResponse<FeedbackResponse> | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const replyRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const filterOptions = useMemo(() => getFeedbackFilterOptions(t), [t]);
  const statusOptions = useMemo(() => getFeedbackStatusOptions(t), [t]);
  const labels = useMemo(() => ({
    reviewImageAlt: t('feedbacks.reviewImageAlt'),
    adminLabel: t('feedbacks.adminLabel'),
    productLabel: t('feedbacks.productLabel'),
    replyLabel: t('feedbacks.reply'),
    replyPlaceholder: t('feedbacks.replyPlaceholder'),
    sendLabel: t('feedbacks.send'),
  }), [t]);

  const fetchReviews = useCallback(async (opts?: { silent?: boolean }) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    if (!opts?.silent) setLoading(true);
    try {
      const res = await adminFeedbackService.getAll({
        status: statusFilter || undefined,
        page,
        size: ADMIN_FEEDBACK_PAGE_SIZE,
      });
      if (requestId !== requestIdRef.current) return;
      setPageData(res.data);
      setReviews(res.data.data || []);
    } catch (err) { console.error('Failed to fetch feedbacks:', err); 
      toast.error(t('feedbacks.toasts.loadFailed')); }
    finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [statusFilter, page, t]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => {
    syncPage(page);
  }, [page, syncPage]);

  const applyReviewUpdate = useCallback((updatedReview: FeedbackResponse) => {
    const filterStatus = statusFilter.trim().toUpperCase();
    const updatedStatus = String(updatedReview.status || '').toUpperCase();
    const keepInCurrentFilter = !filterStatus || updatedStatus === filterStatus;

    setReviews((currentReviews) => {
      if (!keepInCurrentFilter) {
        return currentReviews.filter((review) => review.id !== updatedReview.id);
      }
      return currentReviews.map((review) =>
        review.id === updatedReview.id
          ? { ...review, ...updatedReview }
          : review,
      );
    });

    setPageData((currentPageData) => {
      if (!currentPageData) return currentPageData;
      const nextData = keepInCurrentFilter
        ? currentPageData.data.map((review) =>
            review.id === updatedReview.id
              ? { ...review, ...updatedReview }
              : review,
          )
        : currentPageData.data.filter((review) => review.id !== updatedReview.id);

      return {
        ...currentPageData,
        data: nextData,
        total: keepInCurrentFilter ? currentPageData.total : Math.max(currentPageData.total - 1, 0),
      };
    });
  }, [statusFilter]);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      const res = await adminFeedbackService.updateStatus(id, status);
      applyReviewUpdate(res.data);
    }
    catch (err) { console.error('Update failed:', err); 
      toast.error(t('feedbacks.toasts.statusFailed')); }
  }, [applyReviewUpdate, t]);

  const handleReply = useCallback(async (id: string) => {
    const text = replyRef.current?.value?.trim();
    if (!text) return;
    try {
      const res = await adminFeedbackService.reply(id, text);
      applyReviewUpdate(res.data);
      setReplyId(null);
    } catch (err) { console.error('Reply failed:', err);
       toast.error(t('feedbacks.toasts.replyFailed')); }
  }, [applyReviewUpdate, t]);

  const handleToggleReply = useCallback((id: string) => {
    setReplyId((currentReplyId) => currentReplyId === id ? null : id);
  }, []);

  const handleExport = async () => {
    await startExport({
      type: 'FEEDBACKS',
      params: {
        status: statusFilter || undefined,
      },
      fallbackFilename: `feedbacks_${new Date().toISOString().slice(0, 10)}.xlsx`,
      successMessage: t('feedbacks.toasts.exportSuccess'),
      failureMessage: t('feedbacks.toasts.exportFailed'),
    });
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
            options={filterOptions} className="w-full sm:w-48 z-20 shrink-0" />
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
            <FeedbackCard
              key={review.id}
              review={review}
              statusOptions={statusOptions}
              isReplying={replyId === review.id}
              replyInputRef={replyRef}
              reviewImageAlt={labels.reviewImageAlt}
              adminLabel={labels.adminLabel}
              productLabel={labels.productLabel}
              replyLabel={labels.replyLabel}
              replyPlaceholder={labels.replyPlaceholder}
              sendLabel={labels.sendLabel}
              onStatusChange={handleStatusChange}
              onToggleReply={handleToggleReply}
              onSubmitReply={handleReply}
            />
          ))
        )}
      </div>

      {pageData && (
        <Pagination variant="admin"
          currentPage={page}
          totalPages={pageData.lastPage}
          totalItems={pageData.total}
          perPage={ADMIN_FEEDBACK_PAGE_SIZE}
          label={t('feedbacks.pagination')}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
