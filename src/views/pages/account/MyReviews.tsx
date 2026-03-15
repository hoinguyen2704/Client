import { useState } from 'react';
import { FiStar, FiEdit3, FiTrash2, FiMessageSquare, FiImage, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { mockToReview, mockReviews } from '@/utils/mockAccount';
import EmptyState from '@/components/ui/EmptyState';

export default function MyReviews() {
  const [activeTab, setActiveTab] = useState<'to-review' | 'reviewed'>('to-review');
  const [reviews, setReviews] = useState(mockReviews);
  const [toReview, setToReview] = useState(mockToReview);
  
  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');

  const openReviewModal = (item: any, isEdit = false) => {
    setSelectedItem({ ...item, isEdit });
    if (isEdit) {
      setRating(item.rating);
      setReviewContent(item.content);
    } else {
      setRating(5);
      setReviewContent('');
    }
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem.isEdit) {
      setReviews(reviews.map(r => r.id === selectedItem.id ? { ...r, rating, content: reviewContent } : r));
    } else {
      // Move from to-review to reviewed
      setToReview(toReview.filter(item => item.id !== selectedItem.id));
      setReviews([{
        id: Date.now(),
        productId: selectedItem.productId,
        productSlug: selectedItem.productSlug,
        productName: selectedItem.productName,
        productImage: selectedItem.productImage,
        rating,
        content: reviewContent,
        date: new Date().toLocaleDateString('vi-VN'),
        images: [],
        reply: null
      }, ...reviews]);
      setActiveTab('reviewed');
    }
    closeReviewModal();
  };

  const confirmDelete = (item: any) => {
    setSelectedItem(item);
    setIsConfirmDeleteOpen(true);
  };

  const executeDelete = () => {
    setReviews(reviews.filter(review => review.id !== selectedItem.id));
    setIsConfirmDeleteOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nhận xét của tôi</h1>

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('to-review')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-medium text-center transition-all flex items-center justify-center gap-2 ${
            activeTab === 'to-review' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Cần đánh giá
          {toReview.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'to-review' ? 'bg-white text-purple-600' : 'bg-red-500 text-white'}`}>
              {toReview.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-medium text-center transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reviewed' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Lịch sử đánh giá
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'to-review' ? (
            <motion.div
              key="to-review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {toReview.length > 0 ? (
                toReview.map(item => (
                  <div key={item.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <Link to={`/product/${item.productSlug}`} className="flex items-center gap-4 flex-1 group">
                      <img src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform" />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 transition-colors">{item.productName}</h3>
                        <p className="text-sm text-slate-500 mt-1">Đơn hàng: {item.orderId}</p>
                        <p className="text-sm text-slate-500">Đã nhận: {item.date}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => openReviewModal(item)}
                      className="w-full sm:w-auto btn btn-primary btn-md whitespace-nowrap"
                    >
                      Viết đánh giá
                    </button>
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
              className="space-y-6"
            >
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <motion.div 
                    key={review.id}
                    layout
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                  >
                    {/* Product Info */}
                    <Link to={`/product/${review.productSlug}`} className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-colors group">
                      <img src={review.productImage} alt={review.productName} className="w-16 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform" />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">{review.productName}</h3>
                        <p className="text-sm text-slate-500 mt-1">Đã đánh giá: {review.date}</p>
                      </div>
                    </Link>

                    {/* Review Content */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'} />
                        ))}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {review.content}
                      </p>

                      {review.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                          {review.images.map((img, index) => (
                            <img key={index} src={img} alt="Review" className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer" />
                          ))}
                        </div>
                      )}

                      {/* Seller Reply */}
                      {review.reply && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-4 border border-slate-100 dark:border-slate-800 relative">
                          <div className="absolute -top-3 left-6 w-6 h-6 bg-slate-50 dark:bg-slate-800/50 border-t border-l border-slate-100 dark:border-slate-800 rotate-45"></div>
                          <div className="flex items-center gap-2 mb-2 text-purple-600 font-bold relative z-10">
                            <FiMessageSquare /> Phản hồi từ Hozitech
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm relative z-10">{review.reply}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={() => openReviewModal(review, true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                      >
                        <FiEdit3 /> Sửa
                      </button>
                      <button 
                        onClick={() => confirmDelete(review)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={<FiStar />}
                  title="Chưa có đánh giá nào"
                  description="Bạn chưa viết đánh giá nào cho các sản phẩm đã mua."
                  action={
                    <button onClick={() => setActiveTab('to-review')} className="btn btn-md btn-primary">
                      Đánh giá ngay
                    </button>
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeReviewModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedItem.isEdit ? 'Sửa đánh giá' : 'Viết đánh giá'}
                </h3>
                <button onClick={closeReviewModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <FiX />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="flex items-center gap-4 mb-6">
                  <img src={selectedItem.productImage} alt={selectedItem.productName} className="w-16 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">{selectedItem.productName}</h4>
                </div>

                <form id="review-form" onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chất lượng sản phẩm</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-3xl focus:outline-none transition-transform hover:scale-110"
                        >
                          <FiStar className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                        </button>
                      ))}
                      <span className="ml-3 text-sm font-medium text-slate-500">
                        {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất tệ'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nội dung đánh giá</label>
                    <textarea 
                      required
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                      className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none h-32"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thêm hình ảnh/video</label>
                    <div className="flex gap-4">
                      <button type="button" className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <FiImage className="text-xl mb-1" />
                        <span className="text-xs font-medium">Thêm ảnh</span>
                      </button>
                      {selectedItem.images?.map((img: string, i: number) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                          <img src={img} alt="Review" className="w-full h-full object-cover" />
                          <button type="button" className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiX className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button type="button" onClick={closeReviewModal} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  Trở lại
                </button>
                <button type="submit" form="review-form" className="btn btn-primary btn-md">
                  Hoàn thành
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiTrash2 />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Xóa đánh giá?</h3>
              <p className="text-slate-500 mb-6">Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsConfirmDeleteOpen(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Hủy
                </button>
                <button onClick={executeDelete} className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all">
                  Xóa ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
