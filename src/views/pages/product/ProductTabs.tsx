import { useState, useEffect, useMemo } from 'react';
import { FiStar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ProductResponse, FeedbackResponse } from '@/types';
import { StarRating, ExpandToggle } from '@/components';
import feedbackService from '@/apis/services/feedbackService';

const COLLAPSED_HEIGHT = 320; // px

export default function ProductTabs({ product, images }: { product: ProductResponse; images: string[] }) {
  const { t, i18n } = useTranslation('catalog');
  const [activeTab, setActiveTab] = useState('specs');
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(product.totalReviews || 0);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Reset expanded khi đổi tab
  useEffect(() => { setExpanded(false); }, [activeTab]);

  const rating = product.averageRating || 0;
  const reviews = totalFeedbacks;

  // Parse specs
  const specEntries = useMemo(() => {
    return (product.specs || [])
      .filter((spec) => spec?.name && spec?.value?.trim())
      .map((spec) => [spec.name, spec.value] as [string, string]);
  }, [product.specs]);

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

  // Memoize phân bố sao — tránh 5x O(n) filter mỗi render
  const starDistribution = useMemo(() => {
    const dist: Record<number, number> = {};
    for (let s = 1; s <= 5; s++) {
      const count = feedbacks.filter(f => f.rating === s).length;
      dist[s] = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
    }
    return dist;
  }, [feedbacks]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    } catch { return dateStr; }
  };

  // Memoize grouping + sorting — O(n log n), chỉ chạy khi feedbacks thay đổi
  const groupedFeedbacks = useMemo(() => {
    const groups: Record<string, FeedbackResponse[]> = {};
    feedbacks.forEach(fb => {
      const key = (fb.userId && fb.orderId) ? `${fb.userId}-${fb.orderId}-${fb.variantId || 'null'}` : fb.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(fb);
    });
    return Object.values(groups).map((group: FeedbackResponse[]) => 
      group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  }, [feedbacks]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 sm:mb-12 overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'specs', label: t('productDetail.tabs.specs') },
          { id: 'description', label: t('productDetail.tabs.description') },
          { id: 'reviews', label: t('productDetail.tabs.reviews', { count: reviews }) },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 px-2 py-3 text-center text-sm font-bold transition-colors sm:py-4 sm:text-md lg:text-lg ${activeTab === tab.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}>
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 sm:h-1" />}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-4 md:p-8">
        {/* Collapsible wrapper */}
        <div
          className="relative transition-[max-height] duration-300 ease-in-out overflow-hidden"
          style={!expanded ? { maxHeight: COLLAPSED_HEIGHT } : { maxHeight: '100000px' }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'specs' && (
              <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
                {specEntries.length > 0 ? (
                  <div className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-left">
                      <tbody>
                        {specEntries.map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                            <td className="py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-md sm:text-base font-medium text-slate-500 w-1/3 border-b border-slate-100 dark:border-slate-800">{key}</td>
                            <td className="py-3 sm:py-4 px-4 sm:px-6 md:px-8 text-md sm:text-base font-bold border-b border-slate-100 dark:border-slate-800">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-md sm:text-base text-center py-8">{t('productDetail.tabs.noSpecs')}</p>
                )}
              </motion.div>
            )}
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="prose w-full max-w-none overflow-hidden text-md prose-img:mx-auto prose-img:w-full prose-img:rounded-2xl prose-a:text-blue-700 dark:prose-invert sm:text-base lg:text-lg [&_.cps-block-content]:!max-h-none [&>div>div]:!max-h-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description.replace(/style="[^"]*max-height[^"]*"/g, '') }} />
                ) : (
                  <p className="text-slate-500 text-md sm:text-base">{t('productDetail.tabs.noDescription')}</p>
                )}
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
                {/* Summary */}
                <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-center p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 sm:mb-8 border border-slate-100 dark:border-slate-700">
                  <div className="text-center md:w-1/4">
                    <div className="mb-1 text-4xl font-black text-slate-900 dark:text-slate-50 sm:mb-2 sm:text-5xl md:text-6xl">{rating.toFixed(1)}</div>
                    <div className="flex justify-center gap-1 text-yellow-400 text-base sm:text-xl mb-1 sm:mb-2">
                      <StarRating value={Math.round(rating)} onChange={() => {}} readOnly size="sm" />
                    </div>
                    <div className="text-slate-500 text-md sm:text-base">{t('productDetail.tabs.reviewsCount', { count: reviews })}</div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1 w-9 md:w-12 text-md sm:text-base font-medium">{star} <FiStar className="text-yellow-400 fill-current" /></div>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${starDistribution[star]}%` }}></div>
                        </div>
                        <span className="text-sm sm:text-md text-slate-400 w-8 text-right">{starDistribution[star]}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="md:w-1/4 flex flex-col items-center justify-center w-full">
                    <p className="text-md sm:text-base text-slate-500 text-center">{t('productDetail.tabs.verifiedOnly')}</p>
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
                        <div key={mainFb.id} className="p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {mainFb.userAvatar ? (
                                <img src={mainFb.userAvatar} alt={mainFb.userName} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 sm:h-10 sm:w-10">
                                  {mainFb.userName?.charAt(0)?.toUpperCase() || <FiUser />}
                                </div>
                              )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-md sm:text-base">{mainFb.userName}</h4>
                                  {group.length > 1 && <span className="px-1.5 py-0.5 text-10 font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">{t('productDetail.tabs.round', { count: 1 })}</span>}
                                </div>
                                <div className="flex items-center gap-2 text-sm sm:text-md text-slate-400 mt-0.5">
                                   <span>{formatDate(mainFb.createdAt)}</span>
                                   {mainFb.variantName && (
                                      <>
                                         <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                         <span>{t('productDetail.tabs.variant', { value: mainFb.variantName })}</span>
                                      </>
                                   )}
                                </div>
                              </div>
                            </div>
                            <StarRating value={mainFb.rating} onChange={() => {}} readOnly size="sm" />
                          </div>
                          {mainFb.content && <p className="mt-3 text-md sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{mainFb.content}</p>}
                          {mainFb.adminReply && (
                            <div className="mt-3 p-2.5 sm:p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                              <p className="text-md font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1"><FiMessageSquare /> {t('productDetail.tabs.shopReply')}</p>
                              <p className="text-md sm:text-base text-slate-700 dark:text-slate-300">{mainFb.adminReply}</p>
                            </div>
                          )}
                          
                          {group.length > 1 && (() => {
                            const diffTime = new Date(group[1].createdAt).getTime() - new Date(group[0].createdAt).getTime();
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            const afterText = diffDays === 0
                              ? t('productDetail.tabs.sameDay')
                              : t('productDetail.tabs.afterDays', { count: diffDays });
                            return (
                            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                 <p className="text-md sm:text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                   {t('productDetail.tabs.updatedReview', { afterText })}
                                   <span className="rounded bg-blue-100 px-1.5 py-0.5 text-sm font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">{t('productDetail.tabs.new')}</span>
                                 </p>
                                 <div className="flex items-center gap-2 text-md text-slate-400">
                                    <span>{formatDate(group[1].createdAt)}</span>
                                    <StarRating value={group[1].rating} onChange={() => {}} readOnly size="sm" />
                                 </div>
                              </div>
                              {group[1].content && <p className="text-md sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{group[1].content}</p>}
                              {group[1].adminReply && (
                                <div className="mt-3 p-2.5 sm:p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                  <p className="text-md font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1"><FiMessageSquare /> {t('productDetail.tabs.shopReply')}</p>
                                  <p className="text-md sm:text-base text-slate-700 dark:text-slate-300">{group[1].adminReply}</p>
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
                  <div className="text-center py-8 text-md text-slate-500">
                    <p>{t('productDetail.tabs.emptyReviews')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient overlay khi thu gọn */}
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Nút thu gọn / mở rộng */}
        <div className="flex justify-center mt-3">
          <ExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded(prev => !prev)}
            variant="outline"
          />
        </div>
      </div>
    </div>
  );
}
