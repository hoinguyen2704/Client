import { useState } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiChevronRight, FiStar, FiX } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { orderTabs as tabs, mockOrders } from '@/utils/mockAccount';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'processing':
      return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium"><FiPackage /> Chờ xác nhận</span>;
    case 'shipping':
      return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium"><FiTruck /> Đang giao</span>;
    case 'completed':
      return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium"><FiCheckCircle /> Đã giao</span>;
    case 'cancelled':
      return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium"><FiXCircle /> Đã hủy</span>;
    default:
      return null;
  }
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const handleOpenReview = (order: any) => {
    setSelectedOrder(order);
    setRating(5);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    setReviewModalOpen(false);
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

      {/* Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar border-b border-slate-100 dark:border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <span className="font-bold text-lg mr-4">{order.id}</span>
                  <span className="text-slate-500 text-sm">Ngày đặt: {order.date}</span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <div className="space-y-4">
                {order.items.map(item => (
                  <Link to={`/product/${item.id}`} key={item.id} className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-xl transition-colors group">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-slate-50 dark:bg-slate-800" />
                    <div className="flex-1">
                      <h3 className="font-bold line-clamp-1 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">Phân loại: {item.variant} | Số lượng: x{item.quantity}</p>
                    </div>
                    <div className="font-bold text-purple-600 text-right">
                      {formatPrice(item.price)}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">
                  Tổng tiền: <span className="text-xl font-bold text-purple-600 ml-2">{formatPrice(order.total)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {order.status === 'completed' && (
                    <>
                      <button 
                        onClick={() => handleOpenReview(order)}
                        className="px-4 py-2 rounded-lg border border-purple-600 text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        Đánh giá
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Mua lại
                      </button>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <button className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Hủy đơn
                    </button>
                  )}
                  {order.status === 'cancelled' && (
                    <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Mua lại
                    </button>
                  )}
                  <Link to={`/user/orders/${order.id}`} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-2">
                    Xem chi tiết <FiChevronRight />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-4xl">
              <FiPackage />
            </div>
            <h3 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-slate-500 mb-6">Bạn chưa có đơn hàng nào trong trạng thái này.</p>
            <Link to="/search" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Đánh giá sản phẩm</h3>
                <button onClick={() => setReviewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <img src={selectedOrder.items[0].image} alt={selectedOrder.items[0].name} className="w-16 h-16 object-cover rounded-lg bg-white dark:bg-slate-800" />
                  <div>
                    <h4 className="font-bold line-clamp-1">{selectedOrder.items[0].name}</h4>
                    <p className="text-sm text-slate-500 mt-1">Phân loại: {selectedOrder.items[0].variant}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-center gap-3">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Chất lượng sản phẩm</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-4xl focus:outline-none transition-transform hover:scale-110"
                      >
                        <FiStar className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-700"} />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                    {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Tệ'}
                  </p>
                </div>

                {/* Review Text */}
                <div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                    className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Trở lại
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Gửi đánh giá
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
