import { useState, useEffect } from 'react';
import { FiStar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductResponse, FeedbackResponse } from '@/types';
import { StarRating } from '@/components/ui';
import feedbackService from '@/apis/services/feedbackService';

export default function ProductTabs({ product, images }: { product: ProductResponse; images: string[] }) {
  const [activeTab, setActiveTab] = useState('description');
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(product.totalReviews || 0);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const rating = product.averageRating || 0;
  const reviews = totalFeedbacks;

  // Parse specs
  let specs: Record<string, string> = {};
  try { specs = product.specsJson ? JSON.parse(product.specsJson) : {}; } catch { /* ignore */ }
  const specEntries = Object.entries(specs);

  // Fetch reviews khi chuyển sang tab đánh giá
  useEffect(() => {
    if (activeTab !== 'reviews') return;
    setLoadingFeedbacks(true);
    feedbackService.getByProduct(product.id, feedbackPage, 10)
      .then(res => {
        if (res.data) {
          setFeedbacks(res.data.data || []);
          setTotalFeedbacks(res.data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFeedbacks(false));
  }, [activeTab, feedbackPage, product.id]);

  // Tính phân bố sao từ feedbacks thực tế
  const getStarPercent = (star: number) => {
    if (feedbacks.length === 0) return 0;
    const count = feedbacks.filter(f => f.rating === star).length;
    return Math.round((count / feedbacks.length) * 100);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const groupedFeedbacks = (() => {
    const groups: Record<string, FeedbackResponse[]> = {};
    feedbacks.forEach(fb => {
      // Group by user, order, and variant exactly
      const key = (fb.userId && fb.orderId) ? `${fb.userId}-${fb.orderId}-${fb.variantId || 'null'}` : fb.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(fb);
    });
    return Object.values(groups).map((group: FeedbackResponse[]) => 
      group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  })();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-12 overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'specs', label: 'Thông số kỹ thuật' },
          { id: 'description', label: 'Mô tả sản phẩm' },
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
          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
              {/* Summary */}
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
                        <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all" style={{ width: `${getStarPercent(star)}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{getStarPercent(star)}%</span>
                    </div>
                  ))}
                </div>
                <div className="md:w-1/4 flex flex-col items-center justify-center w-full">
                  <p className="text-sm text-slate-500 text-center">Chỉ khách hàng đã mua và nhận hàng thành công mới có thể đánh giá.</p>
                </div>
              </div>

              {/* Reviews list */}
              {loadingFeedbacks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {groupedFeedbacks.map(group => {
                    const mainFb = group[0];
                    return (
                      <div key={mainFb.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {mainFb.userAvatar ? (
                              <img src={mainFb.userAvatar} alt={mainFb.userName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                                {mainFb.userName?.charAt(0)?.toUpperCase() || <FiUser />}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm">{mainFb.userName}</h4>
                                {group.length > 1 && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">Lần 1</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                 <span>{formatDate(mainFb.createdAt)}</span>
                                 {mainFb.variantName && (
                                    <>
                                       <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                       <span>Phân loại: {mainFb.variantName}</span>
                                    </>
                                 )}
                              </div>
                            </div>
                          </div>
                          <StarRating value={mainFb.rating} onChange={() => {}} readOnly size="sm" />
                        </div>
                        {mainFb.content && <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{mainFb.content}</p>}
                        {mainFb.adminReply && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1"><FiMessageSquare /> Phản hồi từ shop</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{mainFb.adminReply}</p>
                          </div>
                        )}
                        
                        {group.length > 1 && (() => {
                          const diffTime = new Date(group[1].createdAt).getTime() - new Date(group[0].createdAt).getTime();
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          const afterText = diffDays === 0 ? 'trong ngày' : `sau ${diffDays} ngày`;
                          return (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                               <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                 Đánh giá lại ({afterText})
                                 <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded">Mới</span>
                               </p>
                               <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span>{formatDate(group[1].createdAt)}</span>
                                  <StarRating value={group[1].rating} onChange={() => {}} readOnly size="sm" />
                               </div>
                            </div>
                            {group[1].content && <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{group[1].content}</p>}
                            {group[1].adminReply && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1"><FiMessageSquare /> Phản hồi từ shop</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{group[1].adminReply}</p>
                              </div>
                            )}
                          </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
