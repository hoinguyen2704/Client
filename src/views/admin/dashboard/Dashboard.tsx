import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiDownload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Modal, ReportExportModal, StatusBadge, UserAvatar } from '@/components';
import adminDashboardService from '@/apis/services/adminDashboardService';
import type {
  DashboardReviewStatsResponse,
  DashboardStatsResponse,
  DashboardSummaryResponse,
  DashboardTopListsResponse,
  RecentOrderItem,
  RevenueChartItem,
  TopCustomerItem,
  TopProductItem,
  TopVariantItem,
} from '@/types';
import { downloadBlob } from '@/utils/download';
import { formatDate, formatPrice } from '@/utils/format';
import { buildReportFilename } from '@/utils/reportExport';
import { resolveVariantSalesMetrics } from '@/utils/variantSales';
import DashboardStats from './DashboardStats';

const RevenueChart = lazy(() => import('./RevenueChart'));
const OrderChart = lazy(() => import('./OrderChart'));
const CategoryChart = lazy(() => import('./CategoryChart'));
const DashboardLists = lazy(() => import('./DashboardLists'));
const DashboardBottom = lazy(() => import('./DashboardBottom'));

type DashboardPeriod = 'WEEK' | 'MONTH' | 'YEAR';
type SectionKey = 'revenue' | 'orders' | 'categories' | 'lists' | 'bottom';
type ModalKey = 'revenue' | 'orders' | 'customers' | 'products' | 'variants' | 'returns' | 'reviews' | null;

function SectionSkeleton({ heightClassName = 'h-80' }: { heightClassName?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${heightClassName}`}>
      <div className="mb-6 h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="mt-6 h-[calc(100%-8rem)] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-3"
        >
          <div className="mb-2 h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

function DeferredSection({
  active,
  onActivate,
  heightClassName,
  children,
}: {
  active: boolean;
  onActivate: () => void;
  heightClassName: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (active) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onActivate();
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [active, onActivate]);

  return (
    <div ref={ref}>
      {active ? children : <SectionSkeleton heightClassName={heightClassName} />}
    </div>
  );
}

function padRevenueChartData(
  chartData: RevenueChartItem[],
  selectedPeriod: DashboardPeriod,
  locale: string,
) {
  const padded: RevenueChartItem[] = [];
  const chartMap = new Map(chartData.map((item) => [item.label, item]));
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  const numberFormatter = new Intl.NumberFormat(locale);

  const formatYmd = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isToday = (date: Date) =>
    date.getDate() === todayDate &&
    date.getMonth() === todayMonth &&
    date.getFullYear() === todayYear;

  if (selectedPeriod === 'WEEK') {
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const labelKey = formatYmd(date);
      const item = chartMap.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
      const dayName = dayFormatter.format(date);
      const dateStr = `${numberFormatter.format(date.getDate())}/${numberFormatter.format(date.getMonth() + 1)}`;
      const label = isToday(date) ? `${dayName}|${dateStr}|_TODAY` : `${dayName}|${dateStr}`;
      padded.push({ ...item, label });
    }
  } else if (selectedPeriod === 'MONTH') {
    const daysInMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(todayYear, todayMonth, day);
      const labelKey = formatYmd(date);
      const item = chartMap.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
      const label = isToday(date)
        ? `${numberFormatter.format(day)}/${numberFormatter.format(todayMonth + 1)}|_TODAY`
        : `${numberFormatter.format(day)}/${numberFormatter.format(todayMonth + 1)}`;
      padded.push({ ...item, label });
    }
  } else {
    const yearDataByMonth = new Map<number, RevenueChartItem>();
    chartData.forEach((item) => {
      const monthMatch = item.label.match(/(\d{1,2})$/);
      if (monthMatch) {
        yearDataByMonth.set(Number(monthMatch[1]), item);
      }
    });

    for (let month = 1; month <= 12; month += 1) {
      const item = yearDataByMonth.get(month) || {
        label: String(month),
        revenue: 0,
        orders: 0,
      };
      const monthLabel = monthFormatter.format(new Date(todayYear, month - 1, 1));
      const label = month === todayMonth + 1 ? `${monthLabel}|_TODAY` : monthLabel;
      padded.push({ ...item, label });
    }
  }

  return padded;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation('adminDashboard');
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [isReportExportModalOpen, setIsReportExportModalOpen] = useState(false);
  const [period, setPeriod] = useState<DashboardPeriod>('WEEK');
  const [isPeriodPending, startTransition] = useTransition();
  const [revealedSections, setRevealedSections] = useState<Record<SectionKey, boolean>>({
    revenue: false,
    orders: false,
    categories: false,
    lists: false,
    bottom: false,
  });

  const locale = i18n.resolvedLanguage || i18n.language;
  const metricNumberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const activateSection = useCallback((section: SectionKey) => {
    setRevealedSections((current) => (
      current[section] ? current : { ...current, [section]: true }
    ));
  }, []);

  const summaryQuery = useQuery({
    queryKey: ['admin-dashboard-summary', period],
    queryFn: ({ signal }) =>
      adminDashboardService.getSummary(period, { signal }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (summaryQuery.data) {
      activateSection('revenue');
    }
  }, [activateSection, summaryQuery.data]);

  const needsRevenueData = Boolean(summaryQuery.data) && (
    revealedSections.revenue ||
    revealedSections.orders ||
    activeModal === 'revenue'
  );
  const needsTopListsData = Boolean(summaryQuery.data) && (
    revealedSections.categories ||
    revealedSections.lists ||
    activeModal === 'customers' ||
    activeModal === 'products'
  );
  const needsBottomData = Boolean(summaryQuery.data) && (
    revealedSections.bottom ||
    activeModal === 'orders' ||
    activeModal === 'reviews'
  );

  const revenueQuery = useQuery({
    queryKey: ['admin-dashboard-revenue', period],
    queryFn: ({ signal }) =>
      adminDashboardService.getRevenue(period, { signal }).then((res) => res.data),
    enabled: needsRevenueData,
    placeholderData: (previousData) => previousData,
  });

  const topListsQuery = useQuery({
    queryKey: ['admin-dashboard-top-lists', period],
    queryFn: ({ signal }) =>
      adminDashboardService.getTopLists(period, { signal }).then((res) => res.data),
    enabled: needsTopListsData,
    placeholderData: (previousData) => previousData,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['admin-dashboard-recent-orders'],
    queryFn: ({ signal }) =>
      adminDashboardService.getRecentOrders({ signal }).then((res) => res.data || []),
    enabled: needsBottomData,
    placeholderData: (previousData) => previousData,
  });

  const reviewsQuery = useQuery({
    queryKey: ['admin-dashboard-reviews', period],
    queryFn: ({ signal }) =>
      adminDashboardService.getReviews(period, { signal }).then((res) => res.data),
    enabled: needsBottomData,
    placeholderData: (previousData) => previousData,
  });

  const topVariantsQuery = useQuery({
    queryKey: ['admin-dashboard-top-variants', period],
    queryFn: ({ signal }) =>
      adminDashboardService.getTopVariants(period, 100, { signal }).then((res) => res.data || []),
    enabled: activeModal === 'variants',
    placeholderData: (previousData) => previousData,
  });

  const summary = summaryQuery.data as DashboardSummaryResponse | undefined;
  const topLists = topListsQuery.data as DashboardTopListsResponse | undefined;
  const reviewStats = reviewsQuery.data as DashboardReviewStatsResponse | undefined;
  const revenueChart = useMemo(
    () => padRevenueChartData(revenueQuery.data?.revenueChart || [], period, locale),
    [locale, period, revenueQuery.data?.revenueChart],
  );

  const stats = useMemo<DashboardStatsResponse>(() => ({
    totalRevenue: summary?.totalRevenue ?? 0,
    totalOrders: summary?.totalOrders ?? 0,
    newOrders: summary?.newOrders ?? 0,
    totalCustomers: summary?.totalCustomers ?? 0,
    newCustomers: summary?.newCustomers ?? 0,
    productsSold: summary?.productsSold ?? 0,
    cancelledOrders: summary?.cancelledOrders ?? 0,
    returnedOrders: summary?.returnedOrders ?? 0,
    totalFeedbacks: reviewStats?.totalFeedbacks ?? summary?.totalFeedbacks ?? 0,
    newFeedbacks: reviewStats?.newFeedbacks ?? summary?.newFeedbacks ?? 0,
    revenueChart,
    topProducts: topLists?.topProducts ?? [],
    topCategories: topLists?.topCategories ?? [],
    topCustomers: topLists?.topCustomers ?? [],
    recentOrders: recentOrdersQuery.data || [],
    ratingDistribution: reviewStats?.ratingDistribution ?? {},
  }), [revenueChart, recentOrdersQuery.data, reviewStats, summary, topLists]);

  const modalTitle = activeModal ? t(`modals.${activeModal}`) : '';
  const loadingSummary = summaryQuery.isPending && !summaryQuery.data;
  const loadingRevenue = needsRevenueData && revenueQuery.isPending && !revenueQuery.data;
  const loadingTopLists = needsTopListsData && topListsQuery.isPending && !topListsQuery.data;
  const loadingBottom = needsBottomData && !recentOrdersQuery.data && !reviewsQuery.data &&
    (recentOrdersQuery.isPending || reviewsQuery.isPending);
  const loadingTopVariants = activeModal === 'variants' && topVariantsQuery.isPending && !topVariantsQuery.data;

  const revenueSection = loadingRevenue ? (
    <SectionSkeleton heightClassName="h-[26rem]" />
  ) : (
    <Suspense fallback={<SectionSkeleton heightClassName="h-[26rem]" />}>
      <RevenueChart stats={stats} />
    </Suspense>
  );

  const orderSection = loadingRevenue ? (
    <SectionSkeleton heightClassName="h-[26rem]" />
  ) : (
    <Suspense fallback={<SectionSkeleton heightClassName="h-[26rem]" />}>
      <OrderChart stats={stats} />
    </Suspense>
  );

  const categorySection = loadingTopLists ? (
    <SectionSkeleton heightClassName="h-[30rem]" />
  ) : (
    <Suspense fallback={<SectionSkeleton heightClassName="h-[30rem]" />}>
      <CategoryChart stats={stats} />
    </Suspense>
  );

  const listsSection = loadingTopLists ? (
    <SectionSkeleton heightClassName="h-[44rem]" />
  ) : (
    <Suspense fallback={<SectionSkeleton heightClassName="h-[44rem]" />}>
      <DashboardLists stats={stats} />
    </Suspense>
  );

  const bottomSection = loadingBottom ? (
    <SectionSkeleton heightClassName="h-[34rem]" />
  ) : (
    <Suspense fallback={<SectionSkeleton heightClassName="h-[34rem]" />}>
      <DashboardBottom stats={stats} />
    </Suspense>
  );

  return (
    <div className="space-y-4 pb-10 sm:space-y-6 sm:pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{t('overview.title')}</h1>
          <p
            aria-live="polite"
            className={`mt-1 min-h-5 text-lg text-subtle transition-opacity ${isPeriodPending ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {t('overview.refreshing')}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
            {[
              { value: 'WEEK', label: t('overview.periods.week') },
              { value: 'MONTH', label: t('overview.periods.month') },
              { value: 'YEAR', label: t('overview.periods.year') },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => startTransition(() => setPeriod(item.value as DashboardPeriod))}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-lg font-medium transition-colors ${period === item.value
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setActiveModal('variants')}
            variant="outline"
            size="md"
            className="w-full print:hidden sm:w-auto"
          >
            {t('overview.actions.topVariants')}
          </Button>

          <Button
            onClick={() => setIsReportExportModalOpen(true)}
            variant="success"
            size="md"
            icon={<FiDownload />}
            className="w-full print:hidden sm:w-auto"
          >
            {t('overview.actions.exportTimedReport')}
          </Button>

          <Button
            onClick={async () => {
              try {
                const blob = await adminDashboardService.exportReport(period);
                downloadBlob(blob, `revenue_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
                toast.success(t('toasts.exportSuccess'));
              } catch (error) {
                console.error(error);
                toast.error(t('toasts.exportFailed'));
              }
            }}
            variant="success"
            size="md"
            icon={<FiDownload />}
            className="w-full print:hidden sm:w-auto"
          >
            {t('overview.actions.exportReport')}
          </Button>
        </div>
      </div>

      {loadingSummary ? (
        <MetricCardsSkeleton />
      ) : summary ? (
        <>
          <DashboardStats stats={stats} onOpenModal={(modal) => setActiveModal(modal as ModalKey)} />

          <DeferredSection
            active={revealedSections.revenue}
            onActivate={() => activateSection('revenue')}
            heightClassName="h-[26rem]"
          >
            {revenueSection}
          </DeferredSection>

          <DeferredSection
            active={revealedSections.orders}
            onActivate={() => activateSection('orders')}
            heightClassName="h-[26rem]"
          >
            {orderSection}
          </DeferredSection>

          <DeferredSection
            active={revealedSections.categories}
            onActivate={() => activateSection('categories')}
            heightClassName="h-[30rem]"
          >
            {categorySection}
          </DeferredSection>

          <DeferredSection
            active={revealedSections.lists}
            onActivate={() => activateSection('lists')}
            heightClassName="h-[44rem]"
          >
            {listsSection}
          </DeferredSection>

          <DeferredSection
            active={revealedSections.bottom}
            onActivate={() => activateSection('bottom')}
            heightClassName="h-[34rem]"
          >
            {bottomSection}
          </DeferredSection>
        </>
      ) : (
        <div className="py-12 text-center text-subtle">{t('overview.empty')}</div>
      )}

      <Modal
        open={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={modalTitle}
        size="xl"
        scrollable
      >
        {activeModal && summary ? (
          <>
            <div className="mb-3 flex justify-end sm:mb-4">
              <Button
                onClick={async () => {
                  try {
                    toast.loading(t('toasts.creatingPdf'), { id: 'pdf-report' });
                    const blob = await adminDashboardService.exportReportPdf(activeModal, period);
                    downloadBlob(blob, `report_${activeModal}_${new Date().toISOString().slice(0, 10)}.pdf`);
                    toast.success(t('toasts.pdfSuccess'), { id: 'pdf-report' });
                  } catch (error) {
                    console.error(error);
                    toast.error(t('toasts.pdfFailed'), { id: 'pdf-report' });
                  }
                }}
                variant="outline"
                size="sm"
                icon={<FiDownload />}
                className="w-full sm:w-auto"
              >
                {t('overview.actions.downloadPdf')}
              </Button>
            </div>

            {activeModal === 'orders' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm text-muted dark:border-slate-800 sm:text-md">
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.orders.orderNumber')}</th>
                      <th className="whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.orders.customer')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.orders.orderDate')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-right font-medium sm:pb-3">{t('tables.orders.total')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 font-medium sm:pb-3">{t('tables.orders.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBottom ? (
                      <tr>
                        <td className="py-4 text-center text-muted" colSpan={5}>{t('overview.loading.recentOrders')}</td>
                      </tr>
                    ) : (
                      stats.recentOrders.map((order: RecentOrderItem, index: number) => (
                        <tr key={index} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50">
                          <td className="whitespace-nowrap py-2.5 pr-4 text-md font-medium sm:py-4">{order.orderNumber}</td>
                          <td className="whitespace-nowrap py-2.5 pr-4 text-md sm:py-4">{order.customerName}</td>
                          <td className="whitespace-nowrap py-2.5 pr-4 text-md text-muted sm:py-4">{formatDate(order.createdAt)}</td>
                          <td className="whitespace-nowrap py-2.5 pr-4 text-right text-md font-bold sm:py-4">{formatPrice(order.totalAmount)}</td>
                          <td className="whitespace-nowrap py-2.5 sm:py-4"><StatusBadge status={order.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'revenue' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-sm text-muted dark:border-slate-800 sm:text-md">
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-3 font-medium sm:pb-3 sm:pr-4">{t('tables.revenue.time')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-3 text-center font-medium sm:pb-3 sm:pr-4">{t('tables.revenue.orders')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 text-right font-medium sm:pb-3">{t('tables.revenue.revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRevenue ? (
                      <tr>
                        <td className="py-4 text-center text-muted" colSpan={3}>{t('overview.loading.revenue')}</td>
                      </tr>
                    ) : (
                      stats.revenueChart?.map((item: RevenueChartItem, index: number) => {
                        const isToday = item.label.includes('_TODAY');
                        const displayLabel = item.label.replace('|_TODAY', '').split('|').join(' – ');
                        return (
                          <tr
                            key={index}
                            className={`border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
                              isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <td className="whitespace-nowrap py-2.5 pr-3 text-md font-medium sm:py-4 sm:pr-4">
                              {displayLabel}
                              {isToday ? (
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-sm font-bold text-blue-600 dark:bg-blue-900/30">
                                  {t('overview.today')}
                                </span>
                              ) : null}
                            </td>
                            <td className="whitespace-nowrap py-2.5 pr-3 text-center text-md sm:py-4 sm:pr-4">{item.orders}</td>
                            <td className="whitespace-nowrap py-2.5 text-right text-md font-bold text-green-600 sm:py-4">{formatPrice(item.revenue)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {!loadingRevenue ? (
                    <tfoot className="sticky bottom-0 z-10 bg-white dark:bg-slate-900">
                      <tr className="border-t-2 border-slate-200 dark:border-slate-800">
                        <td className="whitespace-nowrap py-2.5 pr-3 pt-3 text-right text-md font-bold sm:py-4 sm:pr-4 sm:pt-4">{t('overview.total')}</td>
                        <td className="whitespace-nowrap py-2.5 pr-3 pt-3 text-center text-md font-bold sm:py-4 sm:pr-4 sm:pt-4">
                          {stats.revenueChart?.reduce((acc, item) => acc + item.orders, 0) || 0}
                        </td>
                        <td className="whitespace-nowrap py-2.5 pt-3 text-right text-base font-bold text-green-600 sm:py-4 sm:pt-4 sm:text-lg">
                          {formatPrice(stats.revenueChart?.reduce((acc, item) => acc + item.revenue, 0) || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            ) : activeModal === 'customers' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-sm text-muted dark:border-slate-800 sm:text-md">
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.rank')}</th>
                      <th className="whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.customers.customer')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.customers.orders')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 text-right font-medium sm:pb-3">{t('tables.customers.spent')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTopLists ? (
                      <tr>
                        <td className="py-4 text-center text-muted" colSpan={4}>{t('overview.loading.customers')}</td>
                      </tr>
                    ) : (
                      stats.topCustomers?.map((customer: TopCustomerItem, index: number) => (
                        <tr key={customer.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50">
                          <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-bold text-subtle sm:py-4">#{index + 1}</td>
                          <td className="py-2.5 pr-4 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <UserAvatar name={customer.name} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate text-md font-bold">{customer.name}</p>
                                <p className="text-sm text-muted">{customer.email || t('overview.noEmail')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md text-muted sm:py-4">{customer.totalOrders}</td>
                          <td className="whitespace-nowrap py-2.5 text-right text-md font-bold text-blue-600 sm:py-4">{formatPrice(customer.totalSpent)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'products' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-sm text-muted dark:border-slate-800 sm:text-md">
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.rank')}</th>
                      <th className="whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.products.product')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.products.sold')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 text-right font-medium sm:pb-3">{t('tables.products.revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTopLists ? (
                      <tr>
                        <td className="py-4 text-center text-muted" colSpan={4}>{t('overview.loading.products')}</td>
                      </tr>
                    ) : (
                      stats.topProducts?.map((product: TopProductItem, index: number) => (
                        <tr key={product.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50">
                          <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-bold text-subtle sm:py-4">#{index + 1}</td>
                          <td className="py-2.5 pr-4 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-subtle dark:bg-slate-800">
                                  ?
                                </div>
                              )}
                              <span className="line-clamp-1 text-md font-bold">{product.name}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-medium text-muted sm:py-4">{product.totalSold}</td>
                          <td className="whitespace-nowrap py-2.5 text-right text-md font-bold text-emerald-600 sm:py-4">{formatPrice(product.revenue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'variants' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-sm text-muted dark:border-slate-800 sm:text-md">
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.rank')}</th>
                      <th className="whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.variants.product')}</th>
                      <th className="whitespace-nowrap pb-2.5 pr-4 font-medium sm:pb-3">{t('tables.variants.variant')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.variants.gross')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.variants.returned')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 pr-4 text-center font-medium sm:pb-3">{t('tables.variants.net')}</th>
                      <th className="w-[1%] whitespace-nowrap pb-2.5 text-right font-medium sm:pb-3">{t('tables.variants.revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTopVariants ? (
                      <tr>
                        <td className="py-4 text-center text-muted" colSpan={7}>{t('overview.loading.variants')}</td>
                      </tr>
                    ) : (
                      (topVariantsQuery.data || []).map((variant: TopVariantItem, index: number) => {
                        const sales = resolveVariantSalesMetrics(variant);
                        return (
                          <tr key={variant.variantId} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50">
                            <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-bold text-subtle sm:py-4">#{index + 1}</td>
                            <td className="py-2.5 pr-4 sm:py-4">
                              <div className="line-clamp-1 text-md font-bold">{variant.productName}</div>
                            </td>
                            <td className="py-2.5 pr-4 sm:py-4">
                              <span className="text-md text-muted">{variant.variantName || t('overview.defaultVariant')}</span>
                            </td>
                            <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-medium text-muted sm:py-4">{metricNumberFormatter.format(sales.gross)}</td>
                            <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-medium text-muted sm:py-4">{metricNumberFormatter.format(sales.returned)}</td>
                            <td className="whitespace-nowrap py-2.5 pr-4 text-center text-md font-bold text-indigo-600 dark:text-indigo-400 sm:py-4">{metricNumberFormatter.format(sales.net)}</td>
                            <td className="whitespace-nowrap py-2.5 text-right text-md font-bold text-emerald-600 sm:py-4">{formatPrice(variant.revenue)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'returns' ? (
              <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:gap-6 sm:p-6">
                <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-900/30 dark:bg-red-900/10 sm:p-8">
                  <p className="mb-2 font-bold uppercase tracking-wide text-red-500">{t('overview.returns.cancelledTitle')}</p>
                  <h2 className="mb-2 text-4xl font-black text-red-600 sm:text-6xl">{stats.cancelledOrders}</h2>
                  <p className="text-md font-medium text-red-600/70">{t('overview.returns.cancelledDescription')}</p>
                </div>
                <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5 text-center dark:border-orange-900/30 dark:bg-orange-900/10 sm:p-8">
                  <p className="mb-2 font-bold uppercase tracking-wide text-orange-500">{t('overview.returns.requestedTitle')}</p>
                  <h2 className="mb-2 text-4xl font-black text-orange-600 sm:text-6xl">{stats.returnedOrders}</h2>
                  <p className="text-md font-medium text-orange-600/70">{t('overview.returns.requestedDescription')}</p>
                </div>
              </div>
            ) : activeModal === 'reviews' ? (
              <div className="p-4 sm:p-8">
                {loadingBottom ? (
                  <div className="py-8 text-center text-muted">{t('overview.loading.reviews')}</div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-center gap-5 border-b border-slate-100 pb-6 dark:border-slate-800 sm:mb-8 sm:gap-8 sm:pb-8">
                      <div className="text-center">
                        <h2 className="text-5xl font-black text-yellow-500 sm:text-7xl">
                          {stats.totalFeedbacks > 0
                            ? (
                              Object.entries(stats.ratingDistribution || {}).reduce(
                                (acc, [rating, count]) => acc + Number(rating) * count,
                                0,
                              ) / stats.totalFeedbacks
                            ).toFixed(1)
                            : '5.0'}
                        </h2>
                        <div className="my-3 flex justify-center text-2xl text-yellow-400">★★★★★</div>
                        <p className="font-medium text-muted">{t('overview.reviewsSummary', { count: stats.totalFeedbacks })}</p>
                      </div>
                    </div>

                    <div className="mx-auto max-w-xl space-y-5">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = stats.ratingDistribution?.[stars] || 0;
                        const percent = stats.totalFeedbacks
                          ? Math.round((count / stats.totalFeedbacks) * 100)
                          : 0;

                        return (
                          <div key={stars} className="flex items-center gap-4">
                            <div className="flex w-16 items-center gap-1.5 text-md font-bold text-body">
                              {stars} <span className="text-lg leading-none text-yellow-400">★</span>
                            </div>
                            <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div className="h-full rounded-full bg-yellow-400 transition-all duration-1000" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="w-12 text-right text-md font-bold text-muted">
                              {percent}%
                            </div>
                            <div className="w-12 text-right text-md text-subtle">
                              ({count})
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted">{t('overview.detailsVisible')}</div>
            )}
          </>
        ) : null}
      </Modal>

      <ReportExportModal
        open={isReportExportModalOpen}
        onClose={() => setIsReportExportModalOpen(false)}
        title={t('reportExport.title')}
        description={t('reportExport.description')}
        submitLabel={t('reportExport.submit')}
        onSubmit={async (params) => {
          try {
            const blob = await adminDashboardService.exportReportByRange(params);
            downloadBlob(blob, buildReportFilename('revenue_report', params));
            toast.success(t('toasts.exportSuccess'));
          } catch (error) {
            console.error(error);
            toast.error(t('toasts.exportFailed'));
            throw error;
          }
        }}
      />
    </div>
  );
}
