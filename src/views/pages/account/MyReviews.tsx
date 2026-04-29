import { useCallback, useEffect, useState } from 'react';
import { FiMessageSquare, FiStar, FiTrash2 } from 'react-icons/fi';
import orderService from '@/apis/services/orderService';
import feedbackService from '@/apis/services/feedbackService';
import type { FeedbackResponse, OrderResponse, ReviewTab, ReviewableItem, ReviewedEntry, ReviewCandidate } from '@/types';
import { Button, EmptyState, Modal, ModalCancelButton, StarRating, ConfirmDialog, SlidingTabs } from '@/components';
import { formatDateShort as formatDate } from '@/utils/format';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { useTranslation } from 'react-i18next';

const SHIPPED_ORDER_STATUS = 'SHIPPED';
const MAX_REVIEW_ATTEMPTS = 2;
const FETCH_PAGE_SIZE = 50;
const MAX_FETCH_PAGES = 10;
const FEEDBACK_BATCH_SIZE = 5;



const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const buildItemKey = (orderNumber: string, productSlug: string, variantSku?: string) =>
  `${orderNumber}:${productSlug}:${variantSku || 'null'}`;

function toReviewableItem(candidate: ReviewCandidate, feedbacks: FeedbackResponse[]): ReviewableItem {
  return {
    itemKey: candidate.itemKey,
    orderNumber: candidate.order.orderNumber,
    productSlug: candidate.item.productSlug as string,
    variantSku: candidate.item.sku,
    productName: candidate.item.productName,
    variantName: candidate.item.variantName,
    productImage: candidate.item.imageUrl,
    deliveredAt: candidate.order.updatedAt || candidate.order.createdAt,
    feedbacks,
  };
}

export default function MyReviews() {
  const { t } = useTranslation('account');
  const [activeTab, setActiveTab] = useState<ReviewTab>('to-review');
  const [loading, setLoading] = useState(true);
  const [toReviewItems, setToReviewItems] = useState<ReviewableItem[]>([]);
  const [reviewedEntries, setReviewedEntries] = useState<ReviewedEntry[]>([]);
  const [itemFeedbackMap, setItemFeedbackMap] = useState<Record<string, FeedbackResponse[]>>({});

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<FeedbackResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadReviewData = useCallback(async () => {
    setLoading(true);
    try {
      const shippedOrders: OrderResponse[] = [];
      let currentPage = 1;
      let lastPage = 1;

      do {
        const res = await orderService.getMyOrders({
          status: SHIPPED_ORDER_STATUS,
          page: currentPage,
          size: FETCH_PAGE_SIZE,
        });
        const pageData = res.data;
        shippedOrders.push(...(pageData?.data || []));
        lastPage = Math.max(pageData?.lastPage || 1, 1);
        currentPage += 1;
      } while (currentPage <= lastPage && currentPage <= MAX_FETCH_PAGES);

      const candidates: ReviewCandidate[] = shippedOrders.flatMap((order) =>
        (order.items || [])
          .filter((item) => Boolean(item.productSlug))
          .map((item) => ({
            order,
            item,
            itemKey: buildItemKey(order.orderNumber, item.productSlug as string, item.sku),
          })),
      );

      // Batch feedback calls to avoid N+1 request flooding
      const candidateResults: { candidate: ReviewCandidate; feedbacks: FeedbackResponse[] }[] = [];
      for (let i = 0; i < candidates.length; i += FEEDBACK_BATCH_SIZE) {
        const batch = candidates.slice(i, i + FEEDBACK_BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (candidate) => {
            try {
              const res = await feedbackService.getMyFeedback(
                candidate.item.productSlug as string,
                candidate.item.sku,
                candidate.order.orderNumber,
              );
              const feedbacks = [...(res.data || [])].sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));
              return { candidate, feedbacks };
            } catch {
              return { candidate, feedbacks: [] as FeedbackResponse[] };
            }
          }),
        );
        candidateResults.push(...batchResults);
      }

      const nextItemFeedbackMap: Record<string, FeedbackResponse[]> = {};
      candidateResults.forEach(({ candidate, feedbacks }) => {
        nextItemFeedbackMap[candidate.itemKey] = feedbacks;
      });

      const nextToReview = candidateResults
        .filter(({ feedbacks }) => feedbacks.length < MAX_REVIEW_ATTEMPTS)
        .map(({ candidate, feedbacks }) => toReviewableItem(candidate, feedbacks))
        .sort((a, b) => toTimestamp(b.deliveredAt) - toTimestamp(a.deliveredAt));

      const nextReviewed = candidateResults
        .flatMap(({ candidate, feedbacks }) => {
          if (feedbacks.length === 0) return [] as ReviewedEntry[];
          return feedbacks.map((review, index) => ({
            key: review.id,
            itemKey: candidate.itemKey,
            orderNumber: candidate.order.orderNumber,
            productSlug: candidate.item.productSlug as string,
            variantSku: candidate.item.sku,
            productName: candidate.item.productName,
            variantName: candidate.item.variantName,
            productImage: candidate.item.imageUrl,
            review,
            round: index + 1,
            totalRounds: feedbacks.length,
          }));
        })
        .sort((a, b) => toTimestamp(b.review.createdAt) - toTimestamp(a.review.createdAt));

      setItemFeedbackMap(nextItemFeedbackMap);
      setToReviewItems(nextToReview);
      setReviewedEntries(nextReviewed);
    } catch (error) {
      console.error('Load my reviews failed', error);
      toast.error(t('myReviews.toasts.loadFailed'));
      setItemFeedbackMap({});
      setToReviewItems([]);
      setReviewedEntries([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadReviewData();
  }, [loadReviewData]);

  const openReviewModal = (item: ReviewableItem) => {
    setSelectedItem(item);
    setRating(5);
    setReviewContent('');
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedItem(null);
    setRating(5);
    setReviewContent('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !reviewContent.trim()) return;

    if (selectedItem.feedbacks.length >= MAX_REVIEW_ATTEMPTS) {
      toast.warning(t('myReviews.toasts.limitReached'));
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submit({
        productSlug: selectedItem.productSlug,
        variantSku: selectedItem.variantSku,
        orderNumber: selectedItem.orderNumber,
        rating,
        content: reviewContent.trim(),
      });
      toast.success(t('myReviews.toasts.submitSuccess'));
      closeReviewModal();
      setActiveTab('reviewed');
      await loadReviewData();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t, 'myReviews.toasts.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const executeDeleteReview = async () => {
    if (!deleteTarget) return;
    try {
      await feedbackService.delete(deleteTarget.id);
      toast.success(t('myReviews.toasts.deleteSuccess'));
      setDeleteTarget(null);
      await loadReviewData();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t, 'myReviews.toasts.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">{t('myReviews.title')}</h1>

      <SlidingTabs
        tabs={[
          { id: 'to-review', label: `${t('myReviews.tabs.toReview')}${toReviewItems.length > 0 ? ` (${toReviewItems.length})` : ''}` },
          { id: 'reviewed', label: `${t('myReviews.tabs.reviewed')}${reviewedEntries.length > 0 ? ` (${reviewedEntries.length})` : ''}` },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as ReviewTab)}
        variant="pill"
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div key={activeTab} className="animate-[fadeSlideIn_0.3s_ease-out]">
          {activeTab === 'to-review' && (
            <div className="space-y-4">
              {toReviewItems.length > 0 ? (
                toReviewItems.map((item) => (
                  <div
                    key={item.itemKey}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={item.productImage || 'https://placehold.co/120x120/f1f5f9/94a3b8?text=No+Image'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-800"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold line-clamp-2">{item.productName}</h3>
                        <p className="text-md text-muted mt-1">{t('myReviews.item.variant')}: {item.variantName || t('myReviews.item.defaultVariant')}</p>
                        <p className="text-md text-muted">{t('myReviews.item.order')}: {item.orderNumber}</p>
                        <p className="text-md text-muted">{t('myReviews.item.deliveredAt')}: {formatDate(item.deliveredAt)}</p>
                        {item.feedbacks.length > 0 && (
                          <p className="text-sm text-orange-600 mt-1">{t('myReviews.item.reviewedCount', { count: item.feedbacks.length, max: MAX_REVIEW_ATTEMPTS })}</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => openReviewModal(item)} size="md" className="w-full sm:w-auto whitespace-nowrap">
                      {item.feedbacks.length > 0 ? t('myReviews.actions.extraReview') : t('myReviews.actions.writeReview')}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-subtle text-3xl">
                    <FiStar />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">{t('myReviews.empty.allReviewedTitle')}</h3>
                  <p className="text-muted">{t('myReviews.empty.allReviewedDescription')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviewed' && (
            <div className="space-y-4">
              {reviewedEntries.length > 0 ? (
                reviewedEntries.map((entry) => {
                  const canReviewMore = entry.round === entry.totalRounds && entry.totalRounds < MAX_REVIEW_ATTEMPTS;
                  const feedbacks = itemFeedbackMap[entry.itemKey] || [];
                  return (
                    <div
                      key={entry.key}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={entry.productImage || 'https://placehold.co/120x120/f1f5f9/94a3b8?text=No+Image'}
                          alt={entry.productName}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold line-clamp-1">{entry.productName}</h3>
                            {entry.totalRounds > 1 && (
                              <span className="px-2 py-0.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-600">
                                {t('myReviews.item.roundBadge', { current: entry.round, max: MAX_REVIEW_ATTEMPTS })}
                              </span>
                            )}
                          </div>
                          <p className="text-md text-muted">{t('myReviews.item.variant')}: {entry.variantName || t('myReviews.item.defaultVariant')}</p>
                          <p className="text-md text-muted">{t('myReviews.item.order')}: {entry.orderNumber}</p>
                          <p className="text-md text-muted">{t('myReviews.item.reviewDate')}: {formatDate(entry.review.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <StarRating value={entry.review.rating} onChange={() => {}} readOnly size="sm" />
                        <p className="text-body leading-relaxed">{entry.review.content}</p>

                        {entry.review.adminReply && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-1 text-blue-600 font-bold text-md">
                              <FiMessageSquare /> {t('myReviews.adminReplyTitle')}
                            </div>
                            <p className="text-md text-muted">{entry.review.adminReply}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {canReviewMore && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              openReviewModal({
                                itemKey: entry.itemKey,
                                orderNumber: entry.orderNumber,
                                productSlug: entry.productSlug,
                                variantSku: entry.variantSku,
                                productName: entry.productName,
                                variantName: entry.variantName,
                                productImage: entry.productImage,
                                deliveredAt: entry.review.createdAt,
                                feedbacks,
                              })
                            }
                          >
                            {t('myReviews.actions.extraReview')}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteTarget(entry.review)}>
                          <FiTrash2 /> {t('myReviews.actions.delete')}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon={<FiStar />}
                  title={t('myReviews.empty.noReviewsTitle')}
                  description={t('myReviews.empty.noReviewsDescription')}
                  action={
                    <Button onClick={() => setActiveTab('to-review')} size="md">
                      {t('myReviews.actions.reviewNow')}
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </div>
      )}

      <Modal
        open={isReviewModalOpen && !!selectedItem}
        onClose={closeReviewModal}
        title={selectedItem?.feedbacks.length ? t('myReviews.modal.extraReviewTitle') : t('myReviews.modal.reviewTitle')}
        scrollable
        footer={
          <>
            <ModalCancelButton onClick={closeReviewModal}>{t('myReviews.actions.back')}</ModalCancelButton>
            <Button type="submit" form="review-form" size="md" loading={submitting} disabled={!reviewContent.trim() || !selectedItem}>
              {t('myReviews.actions.complete')}
            </Button>
          </>
        }
      >
        {selectedItem && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedItem.productImage || 'https://placehold.co/120x120/f1f5f9/94a3b8?text=No+Image'}
                alt={selectedItem.productName}
                className="w-16 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800"
              />
              <div>
                <h4 className="font-bold text-ink line-clamp-2">{selectedItem.productName}</h4>
                <p className="text-md text-muted">{t('myReviews.item.variant')}: {selectedItem.variantName || t('myReviews.item.defaultVariant')}</p>
                <p className="text-md text-muted">{t('myReviews.item.order')}: {selectedItem.orderNumber}</p>
              </div>
            </div>

            <form id="review-form" onSubmit={handleSubmitReview} className="space-y-6">
              {selectedItem.feedbacks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-md font-semibold text-body">{t('myReviews.modal.previousReviews')}</p>
                  {selectedItem.feedbacks.map((fb, idx) => (
                    <div key={fb.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-md font-semibold">{t('myReviews.modal.roundLabel', { count: idx + 1 })}</p>
                        <StarRating value={fb.rating} onChange={() => {}} readOnly size="sm" />
                      </div>
                      <p className="text-md text-muted">{fb.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-md font-medium text-body mb-2">{t('myReviews.modal.ratingLabel')}</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block text-md font-medium text-body mb-2">{t('myReviews.modal.contentLabel')}</label>
                <textarea
                  required
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder={t('myReviews.modal.contentPlaceholder')}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none h-32"
                />
              </div>
            </form>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('myReviews.deleteDialog.title')}
        message={t('myReviews.deleteDialog.message')}
        confirmLabel={t('myReviews.deleteDialog.confirm')}
        variant="danger"
        onConfirm={executeDeleteReview}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
