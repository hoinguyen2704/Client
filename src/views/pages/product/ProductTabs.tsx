import { useState } from 'react';
import { FiStar, FiCheck, FiThumbsUp, FiMessageSquare, FiImage, FiX, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductTabsProps } from './types';

const reviews = [
  { id: 1, user: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/50?img=11', rating: 5, date: '12/10/2026', content: 'Sản phẩm tuyệt vời, đóng gói cẩn thận, giao hàng nhanh.', images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra.png'] },
  { id: 2, user: 'Trần Thị B', avatar: 'https://i.pravatar.cc/50?img=26', rating: 4, date: '10/10/2026', content: 'Máy xài mượt, màn hình đẹp nhưng pin hơi hẻo.', images: [] },
  { id: 3, user: 'Lê Hoàng C', avatar: 'https://i.pravatar.cc/50?img=33', rating: 5, date: '05/10/2026', content: 'Rất hài lòng với chất lượng phục vụ của shop.', images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png', 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-pro-14-2024-m4-1.png'] },
];

export default function ProductTabs({ product, images }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-12 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'description', label: 'Mô tả sản phẩm' },
            { id: 'specs', label: 'Thông số kỹ thuật' },
            { id: 'reviews', label: `Đánh giá (${product.reviews})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center font-bold text-lg transition-colors relative ${activeTab === tab.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}>
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500" />}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose dark:prose-invert max-w-none">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <img src={images[1]} alt="Description" className="rounded-2xl my-8 w-full max-w-3xl mx-auto" />
              <h3>Tính năng nổi bật</h3>
              <ul>
                <li>Hiệu năng mạnh mẽ với chip xử lý mới nhất</li>
                <li>Màn hình sắc nét, tần số quét cao</li>
                <li>Thiết kế mỏng nhẹ, sang trọng</li>
                <li>Thời lượng pin ấn tượng</li>
              </ul>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="max-w-3xl mx-auto border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <tbody>
                    <tr className="bg-slate-100 dark:bg-slate-800"><td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Màn hình</td></tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Công nghệ màn hình</td><td className="py-4 px-6 font-bold">OLED, 120Hz, HDR10+</td></tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Kích thước</td><td className="py-4 px-6 font-bold">6.8 inch</td></tr>
                    <tr className="bg-slate-100 dark:bg-slate-800"><td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Camera</td></tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Camera sau</td><td className="py-4 px-6 font-bold">Chính 50 MP & Phụ 12 MP, 10 MP</td></tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Camera trước</td><td className="py-4 px-6 font-bold">12 MP</td></tr>
                    <tr className="bg-slate-100 dark:bg-slate-800"><td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Vi xử lý & Đồ họa</td></tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Chipset (CPU)</td><td className="py-4 px-6 font-bold">Snapdragon 8 Gen 3</td></tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Chip đồ họa (GPU)</td><td className="py-4 px-6 font-bold">Adreno 750</td></tr>
                    <tr className="bg-slate-100 dark:bg-slate-800"><td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Pin & Sạc</td></tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Dung lượng pin</td><td className="py-4 px-6 font-bold">5000 mAh</td></tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Hỗ trợ sạc tối đa</td><td className="py-4 px-6 font-bold">120W</td></tr>
                    <tr className="bg-slate-100 dark:bg-slate-800"><td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Kết nối</td></tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Cổng sạc</td><td className="py-4 px-6 font-bold">Type-C</td></tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50"><td className="py-4 px-6 font-medium text-slate-500 w-1/3">Jack tai nghe</td><td className="py-4 px-6 font-bold">Không</td></tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Review Overview */}
              <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
                <div className="text-center md:w-1/4">
                  <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-2">{product.rating}</div>
                  <div className="flex justify-center gap-1 text-yellow-400 text-xl mb-2">
                    {[1, 2, 3, 4, 5].map(star => <FiStar key={star} className={star <= Math.round(product.rating) ? 'fill-current' : ''} />)}
                  </div>
                  <div className="text-slate-500">{product.reviews} đánh giá</div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-12 text-sm font-medium">{star} <FiStar className="text-yellow-400 fill-current" /></div>
                      <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : 0}%` }}></div>
                      </div>
                      <div className="w-10 text-sm text-slate-500 text-right">{star === 5 ? 85 : star === 4 ? 25 : star === 3 ? 14 : 0}</div>
                    </div>
                  ))}
                </div>
                <div className="md:w-1/4 flex flex-col items-center justify-center">
                  <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary w-full py-4">Viết đánh giá</button>
                </div>
              </div>

              {/* Review Filters */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button className="px-4 py-2 rounded-lg border border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium">Tất cả</button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 font-medium">5 Sao (85)</button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 font-medium">4 Sao (25)</button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 font-medium flex items-center gap-2"><FiImage /> Có hình ảnh (42)</button>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold">{review.user}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-yellow-400 text-sm">{[1, 2, 3, 4, 5].map(star => <FiStar key={star} className={star <= review.rating ? 'fill-current' : ''} />)}</div>
                            <span className="text-xs text-slate-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full"><FiCheck /> Đã mua hàng</div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">{review.content}</p>
                    {review.images.length > 0 && (
                      <div className="flex gap-3 mb-4">
                        {review.images.map((img, idx) => <img key={idx} src={img} alt="Review" className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 cursor-zoom-in hover:opacity-80 transition-opacity" />)}
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <button className="flex items-center gap-2 hover:text-purple-600 transition-colors"><FiThumbsUp /> Hữu ích (12)</button>
                      <button className="flex items-center gap-2 hover:text-purple-600 transition-colors"><FiMessageSquare /> Thảo luận</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Viết đánh giá</h2>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><FiX className="text-xl" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                  <h3 className="font-bold line-clamp-2">{product.name}</h3>
                </div>
                <div>
                  <label className="block font-medium mb-2">Đánh giá của bạn</label>
                  <div className="flex gap-2 text-3xl text-slate-300 dark:text-slate-600 cursor-pointer">
                    {[1, 2, 3, 4, 5].map(star => <FiStar key={star} className="hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />)}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2">Nội dung đánh giá</label>
                  <textarea rows={4} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                </div>
                <div>
                  <label className="block font-medium mb-2">Thêm hình ảnh</label>
                  <div className="flex gap-3">
                    <button className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all">
                      <FiPlus className="text-2xl mb-1" /><span className="text-xs font-medium">Thêm ảnh</span>
                    </button>
                  </div>
                </div>
                <button onClick={() => setIsReviewModalOpen(false)} className="btn btn-primary w-full py-4">Gửi đánh giá</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
