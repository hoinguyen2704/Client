import { useEffect, useRef, type ReactNode } from 'react';

interface HorizontalInfiniteScrollerProps<T> {
  title?: ReactNode;
  items: T[];
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  hasMore?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  renderLoadingItem?: (index: number) => ReactNode;
  emptyContent?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  scrollerClassName?: string;
  itemClassName?: string;
  skeletonCount?: number;
  scrollThresholdPx?: number;
  showWhenEmpty?: boolean;
}

const DEFAULT_SKELETON_COUNT = 2;
const DEFAULT_SCROLL_THRESHOLD_PX = 360;

function DefaultLoadingItem() {
  return (
    <div className="w-[260px] shrink-0 flex-none rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:w-[280px] xl:w-[288px]">
      <div className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <div className="mt-4 h-5 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="mt-5 h-6 w-3/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function HorizontalInfiniteScroller<T>({
  title,
  items,
  getItemKey,
  renderItem,
  hasMore = false,
  loading = false,
  loadingMore = false,
  onLoadMore,
  renderLoadingItem,
  emptyContent,
  className = '',
  headerClassName = '',
  titleClassName = '',
  scrollerClassName = '',
  itemClassName = '',
  skeletonCount = DEFAULT_SKELETON_COUNT,
  scrollThresholdPx = DEFAULT_SCROLL_THRESHOLD_PX,
  showWhenEmpty = false,
}: HorizontalInfiniteScrollerProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const loadRequestedRef = useRef(false);
  const shouldRender = items.length > 0 || loading || loadingMore || showWhenEmpty;

  useEffect(() => {
    if (!loadingMore) {
      loadRequestedRef.current = false;
    }
  }, [items.length, loadingMore]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || !onLoadMore) return;

    const scrollElement = scrollRef.current;
    const triggerElement = loadMoreTriggerRef.current;
    if (!scrollElement || !triggerElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadRequestedRef.current) return;
        loadRequestedRef.current = true;
        void onLoadMore();
      },
      {
        root: scrollElement,
        rootMargin: `0px ${scrollThresholdPx}px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(triggerElement);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore, scrollThresholdPx]);

  if (!shouldRender) return null;

  const loadingSlots = Array.from({ length: skeletonCount }, (_, index) => index);

  return (
    <section className={className}>
      {title && (
        <div className={`mb-8 flex items-center justify-between gap-3 ${headerClassName}`}>
          <h2 className={`text-2xl font-bold text-ink ${titleClassName}`}>{title}</h2>
        </div>
      )}

      {items.length === 0 && !loading && !loadingMore ? (
        emptyContent
      ) : (
        <div
          ref={scrollRef}
          className={`custom-scrollbar flex snap-x gap-3 overflow-x-auto pb-5 md:gap-5 ${scrollerClassName}`}
        >
          {items.map((item, index) => (
            <div
              key={getItemKey(item, index)}
              className={`w-[260px] shrink-0 snap-start flex-none md:w-[280px] xl:w-[288px] ${itemClassName}`}
            >
              {renderItem(item, index)}
            </div>
          ))}

          {hasMore && <div ref={loadMoreTriggerRef} className="h-1 w-1 shrink-0" aria-hidden="true" />}

          {(loading || loadingMore) && (
            <>
              {loadingSlots.map((index) => (
                <div key={`horizontal-scroller-skeleton-${index}`} className="shrink-0 snap-start flex-none">
                  {renderLoadingItem ? renderLoadingItem(index) : <DefaultLoadingItem />}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}
