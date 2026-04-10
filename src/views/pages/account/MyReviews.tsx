import { useCallback, useEffect, useState } from 'react';
import { FiMessageSquare, FiStar, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import orderService from '@/apis/services/orderService';
import feedbackService from '@/apis/services/feedbackService';
import type { FeedbackResponse, OrderItemResponse, OrderResponse, ReviewTab, ReviewableItem, ReviewedEntry, ReviewCandidate } from '@/types';
import { Button, EmptyState, Modal, ModalCancelButton, StarRating, ConfirmDialog } from '@/components';
import { formatDateShort as formatDate } from '@/utils/format';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';

const SHIPPED_ORDER_STATUS = 'SHIPPED';
const MAX_REVIEW_ATTEMPTS = 2;
const FETCH_PAGE_SIZE = 50;
const MAX_FETCH_PAGES = 10;



const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const buildItemKey = (orderId: string, productId: string, variantId: string) =>
  `${orderId}:${productId}:${variantId}`;

function toReviewableItem(candidate: ReviewCandidate, feedbacks: FeedbackResponse[]): ReviewableItem {
  return {
    itemKey: candidate.itemKey,
    orderId: candidate.order.id,
    orderNumber: candidate.order.orderNumber,
    productId: candidate.item.productId as string,
    variantId: candidate.item.variantId,
    productName: candidate.item.productName,
    variantName: candidate.item.variantName,
    productImage: candidate.item.imageUrl,
    deliveredAt: candidate.order.updatedAt || candidate.order.createdAt,
    feedbacks,
  };
}

export default function MyReviews() {
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
          .filter((item) => Boolean(item.productId) && Boolean(item.variantId))
          .map((item) => ({
            order,
            item,
            itemKey: buildItemKey(order.id, item.productId as string, item.variantId),
          })),
      );

      const candidateResults = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            const res = await feedbackService.getMyFeedback(
              candidate.item.productId as string,
              candidate.item.variantId,
              candidate.order.id,
            );
            const feedbacks = [...(res.data || [])].sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));
            return { candidate, feedbacks };
          } catch {
            return { candidate, feedbacks: [] as FeedbackResponse[] };
          }
        }),
      );

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
            orderId: candidate.order.id,
            orderNumber: candidate.order.orderNumber,
            productId: candidate.item.productId as string,
            variantId: candidate.item.variantId,
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
      toast.error('Không thể tải dữ liệu nhận xét');
      setItemFeedbackMap({});
      setToReviewItems([]);
      setReviewedEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.warning('Bạn đã đạt giới hạn đánh giá cho sản phẩm này');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submit({
        productId: selectedItem.productId,
        variantId: selectedItem.variantId,
        orderId: selectedItem.orderId,
        rating,
        content: reviewContent.trim(),
      });
      toast.success('Gửi đánh giá thành công');
      closeReviewModal();
      setActiveTab('reviewed');
      await loadReviewData();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Gửi đánh giá thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const executeDeleteReview = async () => {
    if (!deleteTarget) return;
    try {
      await feedbackService.delete(deleteTarget.id);
      toast.success('Đã xóa nhận xét');
      setDeleteTarget(null);
      await loadReviewData();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Xóa nhận xét thất bại'));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nhận xét của tôi</h1>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('to-review')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-medium text-center transition-all ${
            activeTab === 'to-review'
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Cần đánh giá {toReviewItems.length > 0 ? `(${toReviewItems.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-medium text-center transition-all ${
            activeTab === 'reviewed'
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Lịch sử đánh giá {reviewedEntries.length > 0 ? `(${reviewedEntries.length})` : ''}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'to-review' ? (
            <motion.div
              key="to-review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {toReviewItems.length > 0 ? (
                toReviewItems.map((item) => (
                  <div
                    key={item.itemKey}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={item.productImage || 'https://placehold.co/120x120/f1f5f9/94a3b8?text=No+Image'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold line-clamp-2">{item.productName}</h3>
                        <p className="text-sm text-slate-500 mt-1">Phân loại: {item.variantName || 'Mặc định'}</p>
                        <p className="text-sm text-slate-500">Đơn hàng: {item.orderNumber}</p>
                        <p className="text-sm text-slate-500">Ngày giao: {formatDate(item.deliveredAt)}</p>
                        {item.feedbacks.length > 0 && (
                          <p className="text-xs text-orange-600 mt-1">Đã đánh giá {item.feedbacks.length}/{MAX_REVIEW_ATTEMPTS} lần</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => openReviewModal(item)} size="md" className="w-full sm:w-auto whitespace-nowrap">
                      {item.feedbacks.length > 0 ? 'Đánh giá bổ sung' : 'Viết đánh giá'}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-3xl">
                    <FiStar />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tuyệt vời!</h3>
                  <p className="text-slate-500">Bạn đã đánh giá tất cả sản phẩm đã mua.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reviewed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {reviewedEntries.length > 0 ? (
                reviewedEntries.map((entry) => {
                  const canReviewMore = entry.round === entry.totalRounds && entry.totalRounds < MAX_REVIEW_ATTEMPTS;
                  const feedbacks = itemFeedbackMap[entry.itemKey] || [];
                  return (
                    <div
                      key={entry.key}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={entry.productImage || 'https://placehold.co/120x120/f1f5f9/94a3b8?text=No+Image'}
                          alt={entry.productName}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold line-clamp-1">{entry.productName}</h3>
                            {entry.totalRounds > 1 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                                Lần {entry.round}/{MAX_REVIEW_ATTEMPTS}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">Phân loại: {entry.variantName || 'Mặc định'}</p>
                          <p className="text-sm text-slate-500">Đơn hàng: {entry.orderNumber}</p>
                          <p className="text-sm text-slate-500">Ngày đánh giá: {formatDate(entry.review.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <StarRating value={entry.review.rating} onChange={() => {}} readOnly size="sm" />
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{entry.review.content}</p>

                        {entry.review.adminReply && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-1 text-purple-600 font-bold text-sm">
                              <FiMessageSquare /> Phản hồi từ Hozitech
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{entry.review.adminReply}</p>
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
                                orderId: entry.orderId,
                                orderNumber: entry.orderNumber,
                                productId: entry.productId,
                                variantId: entry.variantId,
                                productName: entry.productName,
                                variantName: entry.variantName,
                                productImage: entry.productImage,
                                deliveredAt: entry.review.createdAt,
                                feedbacks,
                              })
                            }
                          >
                            Đánh giá bổ sung
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteTarget(entry.review)}>
                          <FiTrash2 /> Xóa
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon={<FiStar />}
                  title="Chưa có đánh giá nào"
                  description="Bạn chưa viết đánh giá nào cho các sản phẩm đã mua."
                  action={
                    <Button onClick={() => setActiveTab('to-review')} size="md">
                      Đánh giá ngay
                    </Button>
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <Modal
        open={isReviewModalOpen && !!selectedItem}
        onClose={closeReviewModal}
        title={selectedItem?.feedbacks.length ? 'Đánh giá bổ sung' : 'Viết đánh giá'}
        scrollable
        footer={
          <>
            <ModalCancelButton onClick={closeReviewModal}>Trở lại</ModalCancelButton>
            <Button type="submit" form="review-form" size="md" loading={submitting} disabled={!reviewContent.trim() || !selectedItem}>
              Hoàn thành
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
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">{selectedItem.productName}</h4>
                <p className="text-sm text-slate-500">Phân loại: {selectedItem.variantName || 'Mặc định'}</p>
                <p className="text-sm text-slate-500">Đơn hàng: {selectedItem.orderNumber}</p>
              </div>
            </div>

            <form id="review-form" onSubmit={handleSubmitReview} className="space-y-6">
              {selectedItem.feedbacks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đánh giá trước đó</p>
                  {selectedItem.feedbacks.map((fb, idx) => (
                    <div key={fb.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold">Lần {idx + 1}</p>
                        <StarRating value={fb.rating} onChange={() => {}} readOnly size="sm" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{fb.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chất lượng sản phẩm</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nội dung đánh giá</label>
                <textarea
                  required
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 resize-none h-32"
                />
              </div>
            </form>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đánh giá?"
        message="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa ngay"
        variant="danger"
        onConfirm={executeDeleteReview}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
