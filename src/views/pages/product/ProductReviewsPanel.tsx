import { FiCheckCircle, FiMessageSquare, FiStar, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { FeedbackImageGrid, StarRating } from '@/components';
import type { FeedbackFilterSummaryResponse, FeedbackResponse, ProductReviewFilter } from '@/types';
import { parseFeedbackImageUrls } from '@/utils/feedback';

interface ProductReviewsPanelProps {
  rating: number;
  reviews: number;
  loading: boolean;
  groupedFeedbacks: FeedbackResponse[][];
  starDistribution: Record<number, number>;
  summary: FeedbackFilterSummaryResponse;
  activeFilter: ProductReviewFilter;
  onFilterChange: (filter: ProductReviewFilter) => void;
  formatDate: (dateStr: string) => string;
}

function ReviewReply({
  content,
  label,
}: {
  content: string;
  label: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-800/40 dark:bg-blue-950/20">
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
        <FiMessageSquare />
        {label}
      </p>
      <p className="text-sm leading-7 text-body sm:text-base">
        {content}
      </p>
    </div>
  );
}

export default function ProductReviewsPanel({
  rating,
  reviews,
  loading,
  groupedFeedbacks,
  starDistribution,
  summary,
  activeFilter,
  onFilterChange,
  formatDate,
}: ProductReviewsPanelProps) {
  const { t } = useTranslation('catalog');
  const filterChips: Array<{
    key: ProductReviewFilter;
    label: string;
  }> = [
    { key: 'all', label: t('productDetail.tabs.reviewFilters.all') },
    ...[5, 4, 3, 2, 1].map((star) => ({
      key: star as ProductReviewFilter,
      label: t('productDetail.tabs.reviewFilters.star', {
        star,
        count: summary.ratingCounts?.[star] || 0,
      }),
    })),
    {
      key: 'with-comment',
      label: t('productDetail.tabs.reviewFilters.withComment', { count: summary.withContent || 0 }),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-center dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
            {t('productDetail.tabs.reviewOverviewTitle')}
          </p>
          <div className="mt-3 text-5xl font-black text-ink sm:text-6xl">
            {rating.toFixed(1)}
          </div>
          <div className="mt-3 flex justify-center">
            <StarRating value={Math.round(rating)} onChange={() => {}} readOnly size="sm" />
          </div>
          <div className="mt-3 text-sm text-muted sm:text-base">
            {t('productDetail.tabs.reviewsCount', { count: reviews })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink sm:text-lg">
              {t('productDetail.tabs.reviewDistributionTitle')}
            </h3>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-muted dark:border-slate-700 dark:bg-slate-800 sm:text-sm">
              {t('productDetail.tabs.reviewsCount', { count: reviews })}
            </span>
          </div>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex w-10 items-center gap-1 text-sm font-semibold text-body">
                  {star}
                  <FiStar className="fill-current text-yellow-400" />
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${starDistribution[star]}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm text-subtle">
                  {starDistribution[star]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-700 dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-300">
            <FiCheckCircle />
            {t('productDetail.tabs.reviewVerifiedBadge')}
          </span>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            {t('productDetail.tabs.verifiedOnly')}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex flex-wrap gap-2.5">
          {filterChips.map((chip) => {
            const isActive = chip.key === activeFilter;
            return (
              <button
                key={String(chip.key)}
                type="button"
                onClick={() => onFilterChange(chip.key)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors sm:text-base ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300'
                    : 'border-slate-200 bg-white text-muted hover:border-slate-300 hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[260px]">
        {loading ? (
          <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
            />
          ))}
          </div>
        ) : groupedFeedbacks.length > 0 ? (
          <div className="space-y-4">
          {groupedFeedbacks.map((group) => {
            const mainFeedback = group[0];
            const updatedFeedback = group[1];
            const mainFeedbackImages = parseFeedbackImageUrls(mainFeedback.imagesJson);
            const updatedFeedbackImages = parseFeedbackImageUrls(updatedFeedback?.imagesJson);

            let afterText = '';
            if (updatedFeedback) {
              const diffTime = new Date(updatedFeedback.createdAt).getTime() - new Date(mainFeedback.createdAt).getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              afterText = diffDays === 0
                ? t('productDetail.tabs.sameDay')
                : t('productDetail.tabs.afterDays', { count: diffDays });
            }

            return (
              <div
                key={mainFeedback.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    {mainFeedback.userAvatar ? (
                      <img
                        src={mainFeedback.userAvatar}
                        alt={mainFeedback.userName}
                        className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 sm:h-12 sm:w-12">
                        {mainFeedback.userName?.charAt(0)?.toUpperCase() || <FiUser />}
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-ink">
                          {mainFeedback.userName}
                        </h4>
                        {mainFeedback.variantName && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-muted dark:border-slate-700 dark:bg-slate-800">
                            {t('productDetail.tabs.variant', { value: mainFeedback.variantName })}
                          </span>
                        )}
                        {group.length > 1 && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
                            {t('productDetail.tabs.round', { count: 1 })}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-subtle">
                        {formatDate(mainFeedback.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StarRating value={mainFeedback.rating} onChange={() => {}} readOnly size="sm" />
                  </div>
                </div>

                {mainFeedback.content && (
                  <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-body sm:text-base">
                    {mainFeedback.content}
                  </p>
                )}

                <FeedbackImageGrid
                  imageUrls={mainFeedbackImages}
                  altPrefix={t('productDetail.tabs.reviewImageAlt')}
                  className="mt-4"
                />

                {mainFeedback.adminReply && (
                  <ReviewReply
                    content={mainFeedback.adminReply}
                    label={t('productDetail.tabs.shopReply')}
                  />
                )}

                {updatedFeedback && (
                  <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-body sm:text-base">
                            {t('productDetail.tabs.updatedReview', { afterText })}
                          </p>
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
                            {t('productDetail.tabs.new')}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-subtle">
                          {formatDate(updatedFeedback.createdAt)}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <StarRating value={updatedFeedback.rating} onChange={() => {}} readOnly size="sm" />
                      </div>
                    </div>

                    {updatedFeedback.content && (
                      <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-body sm:text-base">
                        {updatedFeedback.content}
                      </p>
                    )}

                    <FeedbackImageGrid
                      imageUrls={updatedFeedbackImages}
                      altPrefix={t('productDetail.tabs.reviewImageAlt')}
                      className="mt-4"
                    />

                    {updatedFeedback.adminReply && (
                      <ReviewReply
                        content={updatedFeedback.adminReply}
                        label={t('productDetail.tabs.shopReply')}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        ) : (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <p className="text-base font-semibold text-body">
              {activeFilter === 'all'
                ? t('productDetail.tabs.emptyReviews')
                : t('productDetail.tabs.emptyReviewsFiltered')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
