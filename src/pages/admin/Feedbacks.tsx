import { useState } from 'react';
import { FiSearch, FiFilter, FiEye, FiEyeOff, FiTrash2, FiAlertTriangle, FiStar, FiMessageSquare, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

const mockReviews = [
  { id: 1, product: 'iPhone 15 Pro Max', customer: 'Nguyễn Văn A', rating: 5, content: 'Sản phẩm rất tuyệt vời, giao hàng nhanh chóng. Đóng gói cẩn thận.', date: '20/10/2023', status: 'approved', images: ['https://picsum.photos/seed/r1/100/100'] },
  { id: 2, product: 'MacBook Pro M3', customer: 'Trần Thị B', rating: 4, content: 'Máy đẹp, chạy mượt nhưng giá hơi cao. Pin trâu.', date: '19/10/2023', status: 'pending', images: [] },
  { id: 3, product: 'AirPods Pro 2', customer: 'Lê Văn C', rating: 1, content: 'Tai nghe bị rè một bên, yêu cầu đổi trả ngay lập tức. Rất thất vọng về chất lượng.', date: '18/10/2023', status: 'hidden', images: ['https://picsum.photos/seed/r2/100/100', 'https://picsum.photos/seed/r3/100/100'] },
  { id: 4, product: 'Samsung S24 Ultra', customer: 'Phạm D', rating: 5, content: 'Link mua hàng giá rẻ tại đây: http://spam-link.com', date: '17/10/2023', status: 'spam', images: [] },
];

export default function Feedbacks() {
  const [reviews, setReviews] = useState(mockReviews);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const toggleStatus = (id: number, currentStatus: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: currentStatus === 'approved' ? 'hidden' : 'approved' } : r));
  };

  const markSpam = (id: number) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'spam' } : r));
  };

  const deleteReview = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <div className="flex gap-2">
          <select className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="">Tất cả số sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
          <select className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt (Hiện)</option>
            <option value="hidden">Đã ẩn</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 font-medium">Sản phẩm</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Đánh giá</th>
                <th className="p-4 font-medium">Nội dung</th>
                <th className="p-4 font-medium">Ngày</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-sm">{review.product}</td>
                  <td className="p-4 text-sm">{review.customer}</td>
                  <td className="p-4">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={i < review.rating ? "fill-current" : "text-slate-300 dark:text-slate-600"} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm max-w-[200px] truncate cursor-pointer hover:text-purple-600" onClick={() => setSelectedReview(review)}>
                    {review.content}
                    {review.images.length > 0 && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">+{review.images.length} ảnh</span>}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{review.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.status === 'approved' ? 'bg-green-100 text-green-600' :
                      review.status === 'hidden' ? 'bg-slate-100 text-slate-600' :
                      review.status === 'spam' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {review.status === 'approved' ? 'Hiện' : review.status === 'hidden' ? 'Ẩn' : review.status === 'spam' ? 'Spam' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedReview(review)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Trả lời / Chi tiết"
                      >
                        <FiMessageSquare />
                      </button>
                      <button 
                        onClick={() => toggleStatus(review.id, review.status)}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={review.status === 'approved' ? 'Ẩn' : 'Hiện'}
                      >
                        {review.status === 'approved' ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <button 
                        onClick={() => markSpam(review.id)}
                        className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Đánh dấu Spam"
                      >
                        <FiAlertTriangle />
                      </button>
                      <button 
                        onClick={() => deleteReview(review.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Chi tiết đánh giá</h3>
                <button onClick={() => setSelectedReview(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{selectedReview.customer}</h4>
                    <p className="text-sm text-slate-500">{selectedReview.product} • {selectedReview.date}</p>
                  </div>
                  <div className="flex text-yellow-400 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={i < selectedReview.rating ? "fill-current" : "text-slate-300 dark:text-slate-600"} />
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300">
                  {selectedReview.content}
                </div>

                {selectedReview.images.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 text-sm text-slate-500">Hình ảnh đính kèm</h5>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedReview.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="Review attachment" className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="font-medium mb-3">Trả lời đánh giá</h5>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung trả lời khách hàng..."
                    className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  ></textarea>
                  <div className="flex justify-end mt-3">
                    <button className="px-6 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <FiCheck /> Gửi phản hồi
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
