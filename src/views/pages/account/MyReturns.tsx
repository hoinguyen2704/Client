import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiChevronRight,
  FiClipboard,
  FiPlus,
  FiSearch,
  FiXCircle,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, ConfirmDialog, Pagination, SlidingTabs } from '@/components';
import { formatDateFull as formatDateTime, formatPrice } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/error';
import returnService from '@/apis/services/returnService';
import type { ReturnRequestResponse } from '@/types';
import {
  getUserReturnTabs,
  ReturnStatusBadge,
  RefundStatusBadge,
} from '@/constants/returnConstants';

export default function MyReturns() {
  const { t } = useTranslation(['account', 'common']);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<ReturnRequestResponse | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [page, activeTab]);

  const fetchReturns = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await returnService.getMine({
        status: activeTab !== 'all' ? activeTab : undefined,
        keyword: searchQuery || undefined,
        page: targetPage,
        size: 10,
      });
      setReturns(res.data?.data || []);
      setTotalPages(res.data?.lastPage || 1);
    } catch {
      setReturns([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchReturns(1);
  };

  const handleCancelReturn = async (target: ReturnRequestResponse) => {
    try {
      await returnService.cancel(target.id);
      toast.success(t('returns.toasts.cancelSuccess'));
      fetchReturns();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t, 'account:returns.toasts.cancelFailed'));
    } finally {
      setCancelTarget(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">{t('returns.title')}</h1>
        <Link to="/user/orders" className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold bg-purple-600 text-white hover:bg-purple-700 transition">
          <FiPlus /> {t('returns.goToOrdersToReturn')}
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 sm:space-y-4">
        <SlidingTabs
          tabs={getUserReturnTabs(t)}
          activeTab={activeTab}
          onChange={(id) => { setActiveTab(id); setPage(1); }}
          variant="underline"
        />

        <div className="relative">
          <input
            type="text"
            placeholder={t('returns.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            {t('common:actions.search')}
          </button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse"
            >
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : returns.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-3xl sm:text-4xl">
              <FiClipboard />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">{t('returns.empty.title')}</h3>
            <p className="text-md sm:text-base text-slate-500 mb-6">{t('returns.empty.description')}</p>
            <Link to="/user/orders" className="inline-flex h-11 px-6 rounded-xl items-center justify-center font-semibold bg-purple-600 text-white hover:bg-purple-700 transition">
              {t('returns.empty.action')}
            </Link>
          </div>
        ) : (
          returns.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base sm:text-lg text-purple-600">{item.returnNumber}</span>
                    <ReturnStatusBadge status={item.status} />
                    <RefundStatusBadge status={item.refundStatus} />
                  </div>
                  <p className="text-md text-slate-500">
                    {t('returns.orderNumber')}: <span className="font-semibold text-slate-700 dark:text-slate-200">{item.orderNumber}</span>
                  </p>
                  <p className="text-md text-slate-500">{t('returns.createdAt')}: {formatDateTime(item.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500 uppercase tracking-wide">{t('returns.requestedAmount')}</p>
                  <p className="text-lg font-bold text-purple-600">{formatPrice(Number(item.requestedAmount || 0))}</p>
                  {item.approvedAmount != null && (
                    <p className="text-sm text-slate-500 mt-1">
                      {t('returns.approvedAmount')}: <span className="font-semibold">{formatPrice(Number(item.approvedAmount || 0))}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <p className="text-md text-slate-600 dark:text-slate-300 line-clamp-1">
                  {t('returns.reason')}: <span className="font-medium">{item.reason}</span>
                </p>

                <Link
                  to={`/user/returns/${item.returnNumber}`}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-md font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('returns.viewDetails')} <FiChevronRight />
                </Link>

                {item.status === 'REQUESTED' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCancelTarget(item)}
                    icon={<FiXCircle />}
                    className="justify-center"
                  >
                    {t('returns.cancelRequest')}
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ))
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title={t('returns.cancelDialog.title')}
        message={t('returns.cancelDialog.message', {
          returnNumber: cancelTarget?.returnNumber || t('returns.cancelDialog.fallbackTarget'),
        })}
        confirmLabel={t('returns.cancelDialog.confirm')}
        variant="danger"
        onConfirm={() => cancelTarget && handleCancelReturn(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
