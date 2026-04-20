import { useCallback, useEffect, useState } from 'react';
import { FiClipboard, FiXCircle, FiCheckCircle, FiClock, FiTruck, FiCreditCard, FiDownload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ActionButtons, Pagination, AdminSearch, Button, CustomSelect, ReportExportModal } from '@/components';
import returnService from '@/apis/services/returnService';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { getReturnFilterOptions, canProcessRefund, ReturnStatusBadge, RefundStatusBadge } from '@/constants/returnConstants';
import { formatDate, formatPrice } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/error';
import { downloadBlob } from '@/utils/download';
import { getPaginatedRowNumber } from '@/utils/helpers';
import { buildReportFilename } from '@/utils/reportExport';
import type { PageResponse, ReturnRequestResponse } from '@/types';



export default function AdminReturns() {
  const { t } = useTranslation(['adminSales', 'common']);
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isReportExportModalOpen, setIsReportExportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<ReturnRequestResponse> | null>(null);
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  const fetchReturns = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await returnService.adminGetAll({
        keyword: searchQuery || undefined,
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
      });
      setPageData(res.data);
      setReturns(res.data?.data || []);
    } catch {
      setPageData(null);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleQuickReview = async (target: ReturnRequestResponse, approved: boolean) => {
    const actionKey = `${target.id}:${approved ? 'approve' : 'reject'}`;
    setReviewingKey(actionKey);
    try {
      await returnService.adminReview(target.id, {
        approved,
        note: approved
          ? t('returns.list.notes.quickApprove')
          : t('returns.list.notes.quickReject'),
      });
      toast.success(
        approved
          ? t('returns.list.toasts.reviewApproved')
          : t('returns.list.toasts.reviewRejected'),
      );
      fetchReturns({ silent: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, translate, 'common:errors.reviewReturnFailed'));
    } finally {
      setReviewingKey(null);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await returnService.adminExport({
        status: statusFilter || undefined,
        keyword: searchQuery || undefined,
      });
      downloadBlob(blob, `returns_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(t('returns.list.toasts.exportSuccess'));
    } catch {
      toast.error(t('returns.list.toasts.exportFailed'));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('returns.list.title')}</h1>
          <p className="text-md text-slate-500 mt-1">{t('returns.list.description')}</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button onClick={() => setIsReportExportModalOpen(true)} variant="success" size="md" icon={<FiDownload />}>
            {t('returns.list.reportExport')}
          </Button>
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />}>
            {t('returns.list.export')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-md text-slate-500 font-medium">{t('returns.list.stats.pageTotal')}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{returns.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <FiClipboard className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-md text-slate-500 font-medium">{t('returns.list.stats.pendingReview')}</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                {returns.filter(r => r.status === 'REQUESTED').length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FiClock className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-md text-slate-500 font-medium">{t('returns.list.stats.inProgress')}</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {returns.filter(r => ['APPROVED', 'IN_TRANSIT', 'RECEIVED', 'QC_PASSED', 'QC_FAILED'].includes(r.status)).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FiTruck className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-md text-slate-500 font-medium">{t('returns.list.stats.refundPending')}</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {returns.filter(r => canProcessRefund(r.status) && r.refundStatus !== 'SUCCESS').length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FiCreditCard className="text-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t('returns.list.searchPlaceholder')}
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={getReturnFilterOptions(t)}
          className="w-full md:w-56"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[84px_minmax(100px,1fr)_minmax(100px,1fr)_minmax(200px,1fr)_200px_160px_100px_280px] divide-x divide-slate-200 dark:divide-slate-700 gap-0 bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md font-semibold text-center rounded-t-2xl">
          <div className="px-4 py-4">{t('returns.list.table.index')}</div>
          <div className="px-4 py-4 text-left">{t('returns.list.table.returnNumber')}</div>
          <div className="px-4 py-4 text-left">{t('returns.list.table.orderNumber')}</div>
          <div className="px-4 py-4 text-left">{t('returns.list.table.customer')}</div>
          <div className="px-4 py-4 text-right">{t('returns.list.table.requestedAmount')}</div>
          <div className="px-4 py-4">{t('returns.list.table.status')}</div>
          <div className="px-4 py-4">{t('returns.list.table.createdAt')}</div>
          <div className="px-4 py-4 text-center">{t('returns.list.table.actions')}</div>
        </div>

        <div className="flex flex-col">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col lg:grid lg:grid-cols-[84px_minmax(100px,1fr)_minmax(100px,1fr)_minmax(200px,1fr)_200px_160px_100px_280px] lg:divide-x divide-slate-200 dark:divide-slate-700 items-center border-b border-slate-200 dark:border-slate-700 animate-pulse"
              >
                <div className="hidden lg:flex px-4 py-4 w-full justify-center"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-start hidden lg:flex"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-start hidden lg:flex"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-end hidden lg:flex"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-xl" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" /></div>
              </div>
            ))
          ) : returns.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <FiClipboard className="text-2xl" />
              </div>
              <span>{t('returns.list.empty')}</span>
            </div>
          ) : (
            returns.map((item, index) => {
              const rowNumber = getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index);

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col lg:grid lg:grid-cols-[84px_minmax(100px,1fr)_minmax(100px,1fr)_minmax(200px,1fr)_200px_160px_100px_280px] lg:divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300"
                >
                  <div className="hidden lg:flex items-center justify-center px-4 py-4 h-full font-semibold text-slate-400">
                    {rowNumber}
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-start items-center px-4 py-3 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">{t('returns.list.mobile.returnNumber')}</span>
                    <div className="font-bold text-purple-600 flex items-center gap-2">
                      <span className="inline-flex lg:hidden items-center justify-center min-w-9 h-8 px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-semibold">
                        {rowNumber}
                      </span>
                      {item.returnNumber}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-start items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">{t('returns.list.mobile.orderNumber')}</span>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{item.orderNumber}</div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-start items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">{t('returns.list.mobile.customer')}</span>
                    <div className="text-md">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{item.userName || t('returns.list.unknownUser')}</div>
                      <div className="text-slate-500 text-sm">{item.userEmail || '-'}</div>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-end items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full text-right text-slate-800 dark:text-slate-100">
                    <span className="lg:hidden text-slate-500 text-md">{t('returns.list.mobile.requestedAmount')}</span>
                    <div className="font-bold">{formatPrice(Number(item.requestedAmount || 0))}</div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-center items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full text-center">
                    <span className="lg:hidden text-slate-500 text-md">{t('returns.list.mobile.status')}</span>
                    <div className="flex flex-col xl:flex-row xl:flex-wrap gap-1.5 justify-end lg:justify-center w-full">
                      <ReturnStatusBadge status={item.status} />
                      <RefundStatusBadge status={item.refundStatus} />
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-center items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full text-center">
                    <span className="lg:hidden text-slate-500 text-md">{t('returns.list.mobile.createdAt')}</span>
                    <div className="text-slate-500 text-md font-medium">{formatDate(item.createdAt)}</div>
                  </div>

                  <div className="w-full lg:w-auto mt-3 lg:mt-0 flex justify-end lg:justify-center items-center gap-3 px-4 pb-4 pt-2 lg:px-4 lg:py-4 lg:h-full">
                    {item.status === 'REQUESTED' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleQuickReview(item, true)}
                          loading={reviewingKey === `${item.id}:approve`}
                        >
                          {t('returns.list.quickApprove')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleQuickReview(item, false)}
                          loading={reviewingKey === `${item.id}:reject`}
                        >
                          {t('returns.list.quickReject')}
                        </Button>
                      </>
                    )}
                    <ActionButtons
                      actions={[
                        {
                          type: 'view',
                          href: `/admin/returns/${item.returnNumber}`,
                        },
                      ]}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {pageData && (
          <Pagination variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label={t('returns.list.pagination')}
            onPageChange={setPage}
          />
        )}
      </div>

      <ReportExportModal
        open={isReportExportModalOpen}
        onClose={() => setIsReportExportModalOpen(false)}
        onSubmit={async (params) => {
          try {
            const blob = await returnService.adminExportReportByRange({
              ...params,
              status: statusFilter || undefined,
              keyword: searchQuery || undefined,
            });
            downloadBlob(blob, buildReportFilename('returns_report', params));
            toast.success(t('returns.list.toasts.exportSuccess'));
          } catch (error) {
            console.error(error);
            toast.error(t('returns.list.toasts.exportFailed'));
            throw error;
          }
        }}
      />
    </div>
  );
}
