import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import feedbackService from '@/apis/services/feedbackService';
import type {
  FeedbackFilterSummaryResponse,
  FeedbackResponse,
  ProductResponse,
  ProductReviewFilter,
} from '@/types';
import ProductDescriptionPanel from './ProductDescriptionPanel';
import ProductReviewsPanel from './ProductReviewsPanel';
import ProductSpecsPanel from './ProductSpecsPanel';

type ProductTabId = 'specs' | 'description' | 'reviews';

const groupFeedbacksByOrderRound = (feedbacks: FeedbackResponse[]): FeedbackResponse[][] => {
  const groups: Record<string, FeedbackResponse[]> = {};

  feedbacks.forEach((feedback) => {
    const key = (feedback.userId && feedback.orderId)
      ? `${feedback.userId}-${feedback.orderId}-${feedback.variantId || 'null'}`
      : feedback.id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(feedback);
  });

  return Object.values(groups).map((group) =>
    group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  );
};

export default function ProductTabs({
  product,
}: {
  product: ProductResponse;
  images: string[];
}) {
  const { t, i18n } = useTranslation('catalog');
  const [activeTab, setActiveTab] = useState<ProductTabId>('specs');
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(product.totalReviews || 0);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ProductReviewFilter>('all');
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackFilterSummaryResponse>({
    total: product.totalReviews || 0,
    withContent: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const specEntries = useMemo(
    () =>
      (product.specs || [])
        .filter((spec) => spec?.name && spec?.value?.trim())
        .map((spec) => [spec.name, spec.value] as [string, string]),
    [product.specs],
  );

  useEffect(() => {
    setReviewFilter('all');
  }, [product.id]);

  useEffect(() => {
    if (activeTab !== 'reviews') return;

    let cancelled = false;
    setLoadingFeedbacks(true);
    const requestParams =
      reviewFilter === 'with-comment'
        ? { page: 1, size: 10, hasComment: true }
        : typeof reviewFilter === 'number'
          ? { page: 1, size: 10, rating: reviewFilter }
          : { page: 1, size: 10 };

    feedbackService.getByProduct(product.id, requestParams)
      .then((res) => {
        if (cancelled || !res.data) return;
        setFeedbacks(res.data.data || []);
        setTotalFeedbacks(res.data.summary?.total || res.data.total || 0);
        setFeedbackSummary(res.data.summary || {
          total: res.data.total || 0,
          withContent: 0,
          ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingFeedbacks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, product.id, reviewFilter]);

  const groupedFeedbacks = useMemo(
    () => groupFeedbacksByOrderRound(feedbacks),
    [feedbacks],
  );

  const starDistribution = useMemo(() => {
    const distribution: Record<number, number> = {};
    for (let star = 1; star <= 5; star += 1) {
      const count = feedbackSummary.ratingCounts?.[star] || 0;
      distribution[star] = feedbackSummary.total > 0
        ? Math.round((count / feedbackSummary.total) * 100)
        : 0;
    }
    return distribution;
  }, [feedbackSummary]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US',
        {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        },
      );
    } catch {
      return dateStr;
    }
  };

  const tabs = useMemo(
    () => [
      {
        id: 'specs' as const,
        label: t('productDetail.tabs.specs'),
        meta: t('productDetail.tabs.specsMeta', { count: specEntries.length }),
      },
      {
        id: 'description' as const,
        label: t('productDetail.tabs.description'),
        meta: product.description
          ? t('productDetail.tabs.descriptionMeta')
          : t('productDetail.tabs.descriptionEmptyMeta'),
      },
      {
        id: 'reviews' as const,
        label: t('productDetail.tabs.reviews', { count: totalFeedbacks }),
        meta: t('productDetail.tabs.reviewsCount', { count: totalFeedbacks }),
      },
    ],
    [product.description, specEntries.length, t, totalFeedbacks],
  );

  return (
    <div className="mb-8 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:mb-12">
      <div className="border-b border-slate-100 px-3 pb-3 pt-3 dark:border-slate-800 sm:px-5 sm:pb-4 sm:pt-4">
        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[700px] grid-cols-3 gap-2 md:min-w-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex min-h-[76px] flex-col items-start justify-center rounded-2xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'border-blue-200 bg-blue-50/80 text-blue-700 shadow-sm dark:border-blue-800/60 dark:bg-blue-950/20 dark:text-blue-300'
                      : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="text-sm font-bold sm:text-base lg:text-lg">
                    {tab.label}
                  </span>
                  <span className={`mt-1 text-xs font-medium sm:text-sm ${isActive ? 'text-blue-600/80 dark:text-blue-300/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tab.meta}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="product-tabs-active-indicator"
                      className="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-blue-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ProductSpecsPanel specEntries={specEntries} />
            </motion.div>
          )}

          {activeTab === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ProductDescriptionPanel description={product.description} />
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ProductReviewsPanel
                rating={product.averageRating || 0}
                reviews={totalFeedbacks}
                loading={loadingFeedbacks}
                groupedFeedbacks={groupedFeedbacks}
                starDistribution={starDistribution}
                summary={feedbackSummary}
                activeFilter={reviewFilter}
                onFilterChange={setReviewFilter}
                formatDate={formatDate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
