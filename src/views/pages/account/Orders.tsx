import { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiChevronRight, FiStar, FiX } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import orderService from '@/apis/services/orderService';
import feedbackService from '@/apis/services/feedbackService';
import type { OrderResponse } from '@/types';
import { CLIENT_ORDER_TABS, getClientStatusBadge } from '@/constants/orderConstants';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, size: 10 };
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

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await orderService.cancel(orderId);
      fetchOrders();
    } catch { alert('Hủy đơn hàng thất bại!'); }
  };

  const handleOpenReview = (order: OrderResponse) => {
    setSelectedOrder(order);
    setRating(5);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !selectedOrder.items[0]) return;
    try {
      await feedbackService.submit({ productId: selectedOrder.items[0].variantId, orderId: selectedOrder.id, rating, content: reviewText });
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
      setReviewModalOpen(false);
    } catch { alert('Gửi đánh giá thất bại!'); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar border-b border-slate-100 dark:border-slate-800">
          {CLIENT_ORDER_TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <input type="text" placeholder="Tìm kiếm theo Mã đơn hàng..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <span className="font-bold text-lg mr-4">{order.orderNumber}</span>
                  <span className="text-slate-500 text-sm">Ngày đặt: {formatDate(order.createdAt)}</span>
                </div>
                <div>{getClientStatusBadge(order.orderStatus)}</div>
              </div>

              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-2 -mx-2 rounded-xl">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><FiPackage className="text-2xl" /></div>
                    <div className="flex-1">
                      <h3 className="font-bold line-clamp-1">{item.productName}</h3>
                      <p className="text-sm text-slate-500 mt-1">Phân loại: {item.variantName} | Số lượng: x{item.quantity}</p>
                    </div>
                    <div className="font-bold text-purple-600 text-right">{formatPrice(item.unitPrice)}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">
                  Tổng tiền: <span className="text-xl font-bold text-purple-600 ml-2">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {order.orderStatus === 'SHIPPED' && (
                    <button onClick={() => handleOpenReview(order)} className="px-4 py-2 rounded-lg border border-purple-600 text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">Đánh giá</button>
                  )}
                  {(order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING') && (
                    <button onClick={() => handleCancelOrder(order.id)} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Hủy đơn</button>
                  )}
                  <Link to={`/user/orders/${order.orderNumber}`} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-2">
                    Xem chi tiết <FiChevronRight />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-4xl"><FiPackage /></div>
            <h3 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-slate-500 mb-6">Bạn chưa có đơn hàng nào trong trạng thái này.</p>
            <Link to="/search" className="inline-block btn btn-primary btn-lg">Tiếp tục mua sắm</Link>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Đánh giá sản phẩm</h3>
                <button onClick={() => setReviewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><FiX className="text-xl" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold">{selectedOrder.items[0]?.productName}</h4>
                  <p className="text-sm text-slate-500 mt-1">Phân loại: {selectedOrder.items[0]?.variantName}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Chất lượng sản phẩm</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="text-4xl focus:outline-none transition-transform hover:scale-110">
                        <FiStar className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-700"} />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                    {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Tệ'}
                  </p>
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                  className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
                <button onClick={() => setReviewModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Trở lại</button>
                <button onClick={handleSubmitReview} className="btn btn-primary btn-md">Gửi đánh giá</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
