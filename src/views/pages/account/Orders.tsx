import { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatDate, formatDateFull as formatDateTime } from '@/utils/format';
import { Link } from 'react-router-dom';
import orderService from '@/apis/services/orderService';
import feedbackService from '@/apis/services/feedbackService';
import { Button, ConfirmDialog, Modal, ModalCancelButton, Pagination, PrimaryButton, StarRating, SlidingTabs } from '@/components';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { getClientOrderTabs, getClientStatusBadge } from '@/constants/orderConstants';
import type { OrderResponse, OrderItemResponse, FeedbackResponse } from '@/types';

export default function Orders() {
  const { t } = useTranslation(['account', 'common']);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ productSlug: string, variantSku?: string, productName: string, variantName: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [oldFeedbacks, setOldFeedbacks] = useState<FeedbackResponse[]>([]);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 10 };
      if (activeTab !== 'all') params.status = activeTab;
      if (searchQuery) params.keyword = searchQuery;
      const res = await orderService.getMyOrders(params);
      setOrders(res.data?.data || []);
      setTotalPages(res.data?.lastPage || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleCancelOrder = async (orderNumber: string) => {
    setCancelTarget(null);
    const targetOrder = orders.find((order) => order.orderNumber === orderNumber);
    if (!targetOrder || targetOrder.orderStatus !== 'PENDING') {
      toast.error(t('orders.toasts.cancelPendingOnly'));
      return;
    }
    try {
      await orderService.cancel(orderNumber);
      fetchOrders();
    } catch {
      toast.error(t('orders.toasts.cancelFailed'));
    }
  };

  const handleOpenReview = async (order: OrderResponse, item: OrderItemResponse) => {
    if (!item.productSlug) {
      toast.error(t('orders.toasts.reviewFailed'));
      return;
    }
    setSelectedOrder(order);
    setSelectedItem({ productSlug: item.productSlug, variantSku: item.sku, productName: item.productName, variantName: item.variantName });
    setRating(5);
    setReviewText('');
    setOldFeedbacks([]);
    setReviewModalOpen(true);

    try {
      const res = await feedbackService.getMyFeedback(item.productSlug, item.sku, order.orderNumber);
      if (res.data) {
        setOldFeedbacks(res.data);
      }
    } catch {
      // proceed with defaults
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !selectedItem) return;
    try {
      await feedbackService.submit({ productSlug: selectedItem.productSlug, variantSku: selectedItem.variantSku, orderNumber: selectedOrder.orderNumber, rating, content: reviewText });
      toast.success(t('orders.toasts.reviewSuccess'));
      setReviewModalOpen(false);
    } catch (e: unknown) { 
      toast.error(getApiErrorMessage(e, t, 'account:orders.toasts.reviewFailed')); 
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">{t('orders.title')}</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-4">
        <SlidingTabs
          tabs={getClientOrderTabs(t)}
          activeTab={activeTab}
          onChange={(id) => { setActiveTab(id); setPage(1); }}
          variant="underline"
        />
        <div className="relative">
          <input type="text" placeholder={t('orders.searchPlaceholder')} value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500" />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle text-xl" />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 mb-3 sm:mb-4">
                <div>
                  <span className="font-bold text-base sm:text-lg mr-4">{order.orderNumber}</span>
                  <div className="text-muted text-sm sm:text-md mt-1">
                    {t('orders.placedAt')}: {formatDate(order.createdAt)}
                  </div>
                  <div className="text-muted text-sm sm:text-md mt-1">
                    {t('orders.updatedAt')}: {formatDateTime(order.updatedAt || order.createdAt)}
                  </div>
                </div>
                <div>{getClientStatusBadge(order.orderStatus, t)}</div>
              </div>

              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="w-16 h-18 sm:w-20 sm:h-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <FiPackage className="text-subtle text-2xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-md sm:text-base text-ink line-clamp-1" title={item.productName}>{item.productName}</h3>
                      <p className="text-sm sm:text-md text-muted mt-1">
                        {item.variantName ? `${item.variantName} | ` : ''}{t('orders.quantity')}: x{item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
                      <div className="font-bold text-md sm:text-base text-blue-600">{formatPrice(item.unitPrice)}</div>
                      {order.orderStatus === 'SHIPPED' && (
                        <button onClick={() => handleOpenReview(order, item)} className="px-2.5 sm:px-3 py-1 text-sm sm:text-md rounded border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-white dark:bg-transparent">
                          {t('orders.review')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-muted text-md sm:text-base">
                  {t('orders.total')}: <span className="text-lg sm:text-xl font-bold text-blue-600 ml-2">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {order.orderStatus === 'PENDING' && (
                    <button onClick={() => setCancelTarget(order.orderNumber)} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto">
                      {t('orders.cancelOrder')}
                    </button>
                  )}
                  <Link to={`/user/orders/${order.orderNumber}`} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-medium hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                    {t('orders.viewDetails')} <FiChevronRight />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-subtle text-3xl sm:text-4xl"><FiPackage /></div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">{t('orders.empty.title')}</h3>
            <p className="text-md sm:text-base text-muted mb-6">{t('orders.empty.description')}</p>
            <Button href="/search" size="lg">{t('orders.empty.action')}</Button>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={reviewModalOpen && !!selectedOrder}
        onClose={() => setReviewModalOpen(false)}
        title={t('orders.reviewModal.title')}
        footer={
          <>
            <ModalCancelButton onClick={() => setReviewModalOpen(false)}>{t('orders.reviewModal.back')}</ModalCancelButton>
            {oldFeedbacks.length < 2 ? (
               <PrimaryButton onClick={handleSubmitReview}>{t('orders.reviewModal.submit')}</PrimaryButton>
            ) : (
               <PrimaryButton disabled>{t('orders.reviewModal.maxReviewed')}</PrimaryButton>
            )}
          </>
        }
      >
        {selectedOrder && selectedItem && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold">{selectedItem.productName}</h4>
              <p className="text-md text-muted mt-1">{t('orders.reviewModal.variant')}: {selectedItem.variantName}</p>
            </div>
            
            {oldFeedbacks.map((fb, idx) => (
              <div key={fb.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-80">
                 <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-md text-body">
                      {t('orders.reviewModal.reviewNumber', { count: idx + 1 })}
                    </p>
                    <StarRating value={fb.rating} onChange={() => {}} readOnly size="sm" />
                 </div>
                 <p className="text-md text-muted">{fb.content}</p>
              </div>
            ))}

            {oldFeedbacks.length < 2 && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col items-center gap-2">
                  <p className="font-medium text-body">
                    {oldFeedbacks.length === 1 ? t('orders.reviewModal.additionalReview') : t('orders.reviewModal.quality')}
                  </p>
                  <StarRating value={rating} onChange={setRating} size="lg" />
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t('orders.reviewModal.placeholder')}
                  className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!cancelTarget}
        title={t('orders.cancelDialog.title')}
        message={t('orders.cancelDialog.message')}
        confirmLabel={t('orders.cancelDialog.confirm')}
        variant="danger"
        onConfirm={() => cancelTarget && handleCancelOrder(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
