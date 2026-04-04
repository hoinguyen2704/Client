import { useState } from 'react';
import { FiStar, FiCheck, FiThumbsUp, FiMessageSquare, FiImage, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductResponse } from '@/types';
import { Modal, StarRating } from '@/components/ui';
import { PrimaryButton } from '@/components/ui';
export default function ProductTabs({ product, images }: { product: ProductResponse; images: string[] }) {
  const [activeTab, setActiveTab] = useState('description');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const rating = product.averageRating || 0;
  const reviews = product.totalReviews || 0;

  // Parse specs
  let specs: Record<string, string> = {};
  try { specs = product.specsJson ? JSON.parse(product.specsJson) : {}; } catch { /* ignore */ }
  const specEntries = Object.entries(specs);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-12 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'description', label: 'Mô tả sản phẩm' },
            { id: 'specs', label: 'Thông số kỹ thuật' },
            { id: 'reviews', label: `Đánh giá (${reviews})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center font-bold text-lg transition-colors relative ${activeTab === tab.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}>
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500" />}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="prose dark:prose-invert max-w-none prose-img:w-full prose-img:rounded-2xl prose-img:mx-auto prose-a:text-purple-600 w-full overflow-hidden [&_.cps-block-content]:!max-h-none [&>div>div]:!max-h-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description.replace(/style="[^"]*max-height[^"]*"/g, '') }} />
                ) : (
                  <p className="text-slate-500">Chưa có mô tả cho sản phẩm này.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
                {specEntries.length > 0 ? (
                  <div className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-left">
                      <tbody>
                        {specEntries.map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                            <td className="py-4 px-4 md:px-6 font-medium text-slate-500 w-1/3 border-b border-slate-100 dark:border-slate-800">{key}</td>
                            <td className="py-4 px-4 md:px-6 font-bold border-b border-slate-100 dark:border-slate-800">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Chưa có thông số kỹ thuật cho sản phẩm này.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
                <div className="flex flex-col md:flex-row gap-8 items-center p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
                  <div className="text-center md:w-1/4">
                    <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-2">{rating.toFixed(1)}</div>
                    <div className="flex justify-center gap-1 text-yellow-400 text-xl mb-2">
                      <StarRating value={Math.round(rating)} onChange={() => {}} readOnly size="sm" />
                    </div>
                    <div className="text-slate-500">{reviews} đánh giá</div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1 w-10 md:w-12 text-sm font-medium">{star} <FiStar className="text-yellow-400 fill-current" /></div>
                        <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" style={{ width: `${star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : 5}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="md:w-1/4 flex flex-col items-center justify-center w-full">
                    <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary w-full py-4">Viết đánh giá</button>
                  </div>
                </div>

                <div className="text-center py-8 text-slate-500">
                  <p>Đánh giá sẽ hiển thị khi có dữ liệu từ server.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Viết đánh giá"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img src={product.mainImageUrl || ''} alt={product.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
            <h3 className="font-bold line-clamp-2">{product.name}</h3>
          </div>
          <div>
            <label className="block font-medium mb-2">Đánh giá của bạn</label>
            <StarRating value={0} onChange={() => {}} />
          </div>
          <div>
            <label className="block font-medium mb-2">Nội dung đánh giá</label>
            <textarea rows={4} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
          </div>
        <PrimaryButton
          onClick={() => {setIsReviewModalOpen(false)}}>
          Gửi đánh giá
        </PrimaryButton>
        </div>
      </Modal>
    </>
  );
}
