import { useState, useEffect, useCallback } from 'react';
import { FiDownload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, StatusBadge, Modal, UserAvatar } from '@/components';
import { formatPrice, formatDate } from '@/utils/format';
import { resolveVariantSalesMetrics } from '@/utils/variantSales';
import adminDashboardService from '@/apis/services/adminDashboardService';
import type { DashboardStatsResponse, RecentOrderItem, RevenueChartItem, TopCustomerItem, TopProductItem, TopVariantItem } from '@/types';
import { downloadBlob } from '@/utils/download';
import DashboardStats from './DashboardStats';
import RevenueChart from './RevenueChart';
import OrderChart from './OrderChart';
import CategoryChart from './CategoryChart';
import DashboardLists from './DashboardLists';
import DashboardBottom from './DashboardBottom';

export default function Dashboard() {
  const { t, i18n } = useTranslation('adminDashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [topVariants, setTopVariants] = useState<TopVariantItem[]>([]);
  const [topVariantsLoaded, setTopVariantsLoaded] = useState(false);
  const [loadingTopVariants, setLoadingTopVariants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('WEEK');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getStats(period);
      const data = res.data;
      const locale = i18n.resolvedLanguage || i18n.language;
      const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
      const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
      const numberFormatter = new Intl.NumberFormat(locale);

      // Pad Revenue/Order Chart Data
      const padRevenueChartData = (chartData: RevenueChartItem[], selectedPeriod: string) => {
        const padded: RevenueChartItem[] = [];
        const map = new Map(chartData?.map(item => [item.label, item]) || []);
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        const formatYMD = (date: Date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };

        const isToday = (d: Date) =>
          d.getDate() === todayDate && d.getMonth() === todayMonth && d.getFullYear() === todayYear;

        if (selectedPeriod === 'WEEK') {
          const dayOfWeek = today.getDay();
          const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(today);
          monday.setDate(today.getDate() - diffToMonday);

          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const labelKey = formatYMD(d);
            const item = map.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
            const dayName = dayFormatter.format(d);
            const dateStr = numberFormatter.format(d.getDate()) + '/' + numberFormatter.format(d.getMonth() + 1);
            const label = isToday(d) ? `${dayName}|${dateStr}|_TODAY` : `${dayName}|${dateStr}`;
            padded.push({ ...item, label });
          }
        } else if (selectedPeriod === 'MONTH') {
          const daysInMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(todayYear, todayMonth, i);
            const labelKey = formatYMD(d);
            const item = map.get(labelKey) || { label: labelKey, revenue: 0, orders: 0 };
            const dateStr = numberFormatter.format(i) + '/' + numberFormatter.format(todayMonth + 1);
            const label = isToday(d) ? `${dateStr}|_TODAY` : dateStr;
            padded.push({ ...item, label });
          }
        } else if (selectedPeriod === 'YEAR') {
          for (let i = 1; i <= 12; i++) {
            const sourceLabel = `Tháng ${i}`;
            const fallbackLabel = `Month ${i}`;
            const item = map.get(sourceLabel) || map.get(fallbackLabel) || { label: sourceLabel, revenue: 0, orders: 0 };
            const monthLabel = monthFormatter.format(new Date(todayYear, i - 1, 1));
            const label = i === todayMonth + 1 ? `${monthLabel}|_TODAY` : monthLabel;
            padded.push({ ...item, label });
          }
        }
        return padded;
      };

      data.revenueChart = padRevenueChartData(data.revenueChart || [], period);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, i18n.resolvedLanguage, period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchTopVariants = useCallback(async () => {
    setLoadingTopVariants(true);
    setTopVariantsLoaded(false);
    try {
      const res = await adminDashboardService.getTopVariants(period, 100);
      setTopVariants(res.data || []);
      setTopVariantsLoaded(true);
    } catch (err) {
      console.error('Failed to load top variants:', err);
      toast.error(t('toasts.loadTopVariantsFailed'));
      setTopVariants([]);
      setTopVariantsLoaded(true);
    } finally {
      setLoadingTopVariants(false);
    }
  }, [period, t]);

  useEffect(() => {
    if (activeModal !== 'variants') return;
    void fetchTopVariants();
  }, [activeModal, fetchTopVariants]);

  const modalTitle = activeModal ? t(`modals.${activeModal}`) : '';
  const locale = i18n.resolvedLanguage || i18n.language;
  const metricNumberFormatter = new Intl.NumberFormat(locale);

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('overview.title')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
            {[
              { value: 'WEEK', label: t('overview.periods.week') },
              { value: 'MONTH', label: t('overview.periods.month') },
              { value: 'YEAR', label: t('overview.periods.year') },
            ].map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-md font-medium whitespace-nowrap transition-colors ${period === p.value ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setActiveModal('variants')}
            variant="outline"
            size="md"
            className="print:hidden w-full sm:w-auto"
          >
            {t('overview.actions.topVariants')}
          </Button>
          <Button
            onClick={async () => {
              try {
                const blob = await adminDashboardService.exportReport(period);
                downloadBlob(blob, `revenue_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
                toast.success(t('toasts.exportSuccess'));
              } catch (err) {
                console.error(err);
                toast.error(t('toasts.exportFailed'));
              }
            }}
            variant="success"
            size="md"
            icon={<FiDownload />}
            className="print:hidden w-full sm:w-auto"
          >
            {t('overview.actions.exportReport')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
              <div className="h-3 w-12 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 sm:h-5 w-16 sm:w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          <DashboardStats stats={stats} onOpenModal={setActiveModal} />
          <RevenueChart stats={stats} />
          <OrderChart stats={stats} />
          <CategoryChart stats={stats} />
          <DashboardLists stats={stats} />
          <DashboardBottom stats={stats} />
        </>
      ) : (
        <div className="text-center text-slate-400 py-12">{t('overview.empty')}</div>
      )}

      <Modal
        open={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={modalTitle}
        size="xl"
        scrollable
      >
        {activeModal && stats && (
          <>
            <div className="flex justify-end mb-3 sm:mb-4">
              <Button
                onClick={async () => {
                  if (!activeModal) return;
                  try {
                    toast.loading(t('toasts.creatingPdf'), { id: 'pdf-report' });
                    const blob = await adminDashboardService.exportReportPdf(activeModal, period);
                    downloadBlob(blob, `report_${activeModal}_${new Date().toISOString().slice(0, 10)}.pdf`);
                    toast.success(t('toasts.pdfSuccess'), { id: 'pdf-report' });
                  } catch (err) {
                    console.error(err);
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
                <table className="table-auto w-max min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm sm:text-md">
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap w-[1%]">{t('tables.orders.orderNumber')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap">{t('tables.orders.customer')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap w-[1%]">{t('tables.orders.orderDate')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium text-right whitespace-nowrap w-[1%]">{t('tables.orders.total')}</th>
                      <th className="pb-2.5 sm:pb-3 font-medium whitespace-nowrap w-[1%]">{t('tables.orders.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: RecentOrderItem, index: number) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 sm:py-4 pr-4 text-md font-medium whitespace-nowrap">{order.orderNumber}</td>
                        <td className="py-2.5 sm:py-4 pr-4 text-md whitespace-nowrap">{order.customerName}</td>
                        <td className="py-2.5 sm:py-4 pr-4 text-md text-slate-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                        <td className="py-2.5 sm:py-4 pr-4 text-md text-right font-bold whitespace-nowrap">{formatPrice(order.totalAmount)}</td>
                        <td className="py-2.5 sm:py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'revenue' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm sm:text-md">
                      <th className="pb-2.5 sm:pb-3 pr-3 sm:pr-4 font-medium whitespace-nowrap w-[1%]">{t('tables.revenue.time')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-3 sm:pr-4 font-medium text-center whitespace-nowrap w-[1%]">{t('tables.revenue.orders')}</th>
                      <th className="pb-2.5 sm:pb-3 font-medium text-right whitespace-nowrap w-[1%]">{t('tables.revenue.revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.revenueChart?.map((item: RevenueChartItem, index: number) => {
                      const isToday = item.label.includes('_TODAY');
                      const displayLabel = item.label.replace('|_TODAY', '').split('|').join(' – ');
                      return (
                        <tr key={index} className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isToday ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                          <td className="py-2.5 sm:py-4 pr-3 sm:pr-4 text-md font-medium whitespace-nowrap">
                            {displayLabel}
                            {isToday && <span className="ml-2 text-sm font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">{t('overview.today')}</span>}
                          </td>
                          <td className="py-2.5 sm:py-4 pr-3 sm:pr-4 text-md text-center whitespace-nowrap">{item.orders}</td>
                          <td className="py-2.5 sm:py-4 text-md text-right font-bold text-green-600 whitespace-nowrap">{formatPrice(item.revenue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10 bg-white dark:bg-slate-900">
                    <tr className="border-t-2 border-slate-200 dark:border-slate-800">
                      <td className="py-2.5 sm:py-4 pr-3 sm:pr-4 text-md font-bold text-right pt-3 sm:pt-4 whitespace-nowrap">{t('overview.total')}</td>
                      <td className="py-2.5 sm:py-4 pr-3 sm:pr-4 text-md text-center font-bold pt-3 sm:pt-4 whitespace-nowrap">{stats.revenueChart?.reduce((acc: number, item: RevenueChartItem) => acc + item.orders, 0) || 0}</td>
                      <td className="py-2.5 sm:py-4 text-right font-bold text-base sm:text-lg pt-3 sm:pt-4 text-green-600 whitespace-nowrap">
                        {formatPrice(stats.revenueChart?.reduce((acc: number, item: RevenueChartItem) => acc + item.revenue, 0) || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : activeModal === 'customers' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm sm:text-md">
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.rank')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap">{t('tables.customers.customer')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.customers.orders')}</th>
                      <th className="pb-2.5 sm:pb-3 font-medium w-[1%] text-right whitespace-nowrap">{t('tables.customers.spent')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topCustomers?.map((customer: TopCustomerItem, index: number) => (
                      <tr key={customer.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 sm:py-4 pr-4 text-center text-md font-bold text-slate-400 whitespace-nowrap">#{index + 1}</td>
                        <td className="py-2.5 sm:py-4 pr-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <UserAvatar name={customer.name} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-md truncate">{customer.name}</p>
                              <p className="text-sm text-slate-500">{customer.email || t('overview.noEmail')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-4 pr-4 text-md text-center text-slate-500 whitespace-nowrap">{customer.totalOrders}</td>
                        <td className="py-2.5 sm:py-4 text-md text-right font-bold text-purple-600 whitespace-nowrap">{formatPrice(customer.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'products' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm sm:text-md">
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.rank')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap">{t('tables.products.product')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.products.sold')}</th>
                      <th className="pb-2.5 sm:pb-3 font-medium w-[1%] text-right whitespace-nowrap">{t('tables.products.revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts?.map((p: TopProductItem, index: number) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 sm:py-4 pr-4 text-center text-md font-bold text-slate-400 whitespace-nowrap">#{index + 1}</td>
                        <td className="py-2.5 sm:py-4 pr-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-300">
                                ?
                              </div>
                            )}
                            <span className="font-bold text-md line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-4 pr-4 text-md text-center font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{p.totalSold}</td>
                        <td className="py-2.5 sm:py-4 text-md text-right font-bold text-emerald-600 whitespace-nowrap">{formatPrice(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'variants' ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-max min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 text-sm sm:text-md">
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.rank')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap">{t('tables.variants.product')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium whitespace-nowrap">{t('tables.variants.variant')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.variants.gross')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.variants.returned')}</th>
                      <th className="pb-2.5 sm:pb-3 pr-4 font-medium w-[1%] text-center whitespace-nowrap">{t('tables.variants.net')}</th>
                      <th className="pb-2.5 sm:pb-3 font-medium w-[1%] text-right whitespace-nowrap">{t('tables.variants.revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topVariantsLoaded ? topVariants : (stats.topVariants || [])).map((v: TopVariantItem, index: number) => {
                      const sales = resolveVariantSalesMetrics(v);

                      return (
                        <tr key={v.variantId} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 sm:py-4 pr-4 text-center text-md font-bold text-slate-400 whitespace-nowrap">#{index + 1}</td>
                          <td className="py-2.5 sm:py-4 pr-4">
                            <div className="font-bold text-md line-clamp-1">{v.productName}</div>
                          </td>
                          <td className="py-2.5 sm:py-4 pr-4">
                            <span className="text-md text-slate-600 dark:text-slate-300">{v.variantName || t('overview.defaultVariant')}</span>
                          </td>
                          <td className="py-2.5 sm:py-4 pr-4 text-md text-center font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{metricNumberFormatter.format(sales.gross)}</td>
                          <td className="py-2.5 sm:py-4 pr-4 text-md text-center font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{metricNumberFormatter.format(sales.returned)}</td>
                          <td className="py-2.5 sm:py-4 pr-4 text-md text-center font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{metricNumberFormatter.format(sales.net)}</td>
                          <td className="py-2.5 sm:py-4 text-md text-right font-bold text-emerald-600 whitespace-nowrap">{formatPrice(v.revenue)}</td>
                        </tr>
                      );
                    })}
                    {loadingTopVariants && topVariants.length === 0 && (
                      <tr>
                        <td className="py-4 text-center text-slate-500" colSpan={7}>{t('overview.loadingVariants')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeModal === 'returns' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-5 sm:p-8 text-center border border-red-100 dark:border-red-900/30">
                  <p className="text-red-500 font-bold mb-2 uppercase tracking-wide">{t('overview.returns.cancelledTitle')}</p>
                  <h2 className="text-4xl sm:text-6xl font-black text-red-600 mb-2">{stats.cancelledOrders}</h2>
                  <p className="text-md text-red-600/70 font-medium">{t('overview.returns.cancelledDescription')}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-5 sm:p-8 text-center border border-orange-100 dark:border-orange-900/30">
                  <p className="text-orange-500 font-bold mb-2 uppercase tracking-wide">{t('overview.returns.requestedTitle')}</p>
                  <h2 className="text-4xl sm:text-6xl font-black text-orange-600 mb-2">{stats.returnedOrders}</h2>
                  <p className="text-md text-orange-600/70 font-medium">{t('overview.returns.requestedDescription')}</p>
                </div>
              </div>
            ) : activeModal === 'reviews' ? (
              <div className="p-4 sm:p-8">
                <div className="flex items-center justify-center gap-5 sm:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <h2 className="text-5xl sm:text-7xl font-black text-yellow-500">{stats.totalFeedbacks > 0 ? (
                        Object.entries(stats.ratingDistribution || {}).reduce((acc, [rating, count]) => acc + Number(rating) * count, 0) / stats.totalFeedbacks
                      ).toFixed(1) : '5.0'}</h2>
                    <div className="flex text-yellow-400 text-2xl justify-center my-3">★★★★★</div>
                    <p className="text-slate-500 font-medium">{t('overview.reviewsSummary', { count: stats.totalFeedbacks })}</p>
                  </div>
                </div>
                <div className="space-y-5 max-w-xl mx-auto">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = stats.ratingDistribution?.[stars] || 0;
                    const percent = stats.totalFeedbacks ? Math.round((count / stats.totalFeedbacks) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 w-16 text-md font-bold text-slate-700 dark:text-slate-300">
                          {stars} <span className="text-yellow-400 text-lg leading-none">★</span>
                        </div>
                        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="w-12 text-md font-bold text-right text-slate-600 dark:text-slate-400">
                          {percent}%
                        </div>
                        <div className="w-12 text-md text-right text-slate-400">
                          ({count})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">{t('overview.detailsVisible')}</div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
