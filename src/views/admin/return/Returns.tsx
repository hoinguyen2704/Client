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
import { useAsyncExportJob, usePageQueryParam } from '@/hooks';
import {
  ADMIN_GRID_TABLE_HEADER_BASE_CLASS,
  ADMIN_GRID_TABLE_ROW_BASE_CLASS,
  ADMIN_GRID_TABLE_SKELETON_ROW_BASE_CLASS,
  AdminTableCard,
} from '@/components/ui/AdminTable';

const RETURN_TABLE_GRID_COLUMNS = 'grid-cols-[84px_260px_260px_minmax(240px,1fr)_minmax(170px,1fr)_minmax(200px,1fr)_100px_200px]';



export default function AdminReturns() {
  const { t } = useTranslation(['adminSales', 'common']);
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isReportExportModalOpen, setIsReportExportModalOpen] = useState(false);
  const { initialPage, returnTo, syncPage } = usePageQueryParam();
  const [page, setPage] = useState(initialPage);
  const [pageData, setPageData] = useState<PageResponse<ReturnRequestResponse> | null>(null);
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);
  const { isExporting, startExport } = useAsyncExportJob();
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

  useEffect(() => {
    syncPage(page);
  }, [page, syncPage]);

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
    await startExport({
      type: 'RETURNS',
      params: {
        status: statusFilter || undefined,
        keyword: searchQuery || undefined,
      },
      fallbackFilename: `returns_${new Date().toISOString().slice(0, 10)}.xlsx`,
      successMessage: t('returns.list.toasts.exportSuccess'),
      failureMessage: t('returns.list.toasts.exportFailed'),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('returns.list.title')}</h1>
          <p className="text-md text-muted mt-1">{t('returns.list.description')}</p>
        </div>
        <div className="flex items-center gap-3 print:hidden shrink-0">
          <Button onClick={() => setIsReportExportModalOpen(true)} variant="success" size="md" icon={<FiDownload />}>
            {t('returns.list.reportExport')}
          </Button>
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />} loading={isExporting}>
            {t('returns.list.export')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-md text-muted font-medium">{t('returns.list.stats.pageTotal')}</p>
              <h3 className="text-2xl font-bold mt-1 text-ink">{returns.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted">
              <FiClipboard className="text-lg" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-md text-muted font-medium">{t('returns.list.stats.pendingReview')}</p>
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
              <p className="text-md text-muted font-medium">{t('returns.list.stats.inProgress')}</p>
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
              <p className="text-md text-muted font-medium">{t('returns.list.stats.refundPending')}</p>
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-3 shadow-sm dark:border-slate-800 sm:p-4 flex items-center gap-4">
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
          className="w-56 shrink-0"
        />
      </div>

      <AdminTableCard>
        {/* Desktop Header */}
        <div className={`${ADMIN_GRID_TABLE_HEADER_BASE_CLASS} ${RETURN_TABLE_GRID_COLUMNS}`}>
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
                className={`${ADMIN_GRID_TABLE_SKELETON_ROW_BASE_CLASS} ${RETURN_TABLE_GRID_COLUMNS}`}
              >
                <div className="flex justify-center px-4 py-4"><div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="px-4 py-4"><div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-end px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-8 w-40 rounded-xl bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-8 w-36 rounded-xl bg-slate-200 dark:bg-slate-700" /></div>
              </div>
            ))
          ) : returns.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-subtle">
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
                  className={`${ADMIN_GRID_TABLE_ROW_BASE_CLASS} ${RETURN_TABLE_GRID_COLUMNS}`}
                >
                  <div className="flex items-center justify-center px-4 py-4 font-semibold text-subtle">
                    {rowNumber}
                  </div>

                  <div className="flex min-w-0 items-center px-4 py-4">
                    <div className="min-w-0 break-words font-bold text-blue-600 [overflow-wrap:anywhere]">
                      {item.returnNumber}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center px-4 py-4">
                    <div className="min-w-0 break-words font-medium text-body [overflow-wrap:anywhere]">
                      {item.orderNumber}
                    </div>
                  </div>

                  <div className="min-w-0 px-4 py-4">
                    <div className="min-w-0 text-md leading-snug">
                      <div className="break-words font-medium text-ink [overflow-wrap:anywhere]">
                        {item.userName || t('returns.list.unknownUser')}
                      </div>
                      <div className="break-words text-sm text-muted [overflow-wrap:anywhere]">
                        {item.userEmail || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end px-4 py-4 text-right text-ink">
                    <div className="font-bold">{formatPrice(Number(item.requestedAmount || 0))}</div>
                  </div>

                  <div className="flex items-center justify-center px-4 py-4 text-center">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <ReturnStatusBadge status={item.status} />
                      <RefundStatusBadge status={item.refundStatus} />
                    </div>
                  </div>

                  <div className="flex items-center justify-center px-4 py-4 text-center">
                    <div className="text-muted text-md font-medium">{formatDate(item.createdAt)}</div>
                  </div>

                  <div className="flex items-center justify-center gap-3 px-4 py-4">
                    {item.status === 'REQUESTED' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleQuickReview(item, true)}
                          loading={reviewingKey === `${item.id}:approve`}
                          icon={<FiCheckCircle />}
                          title={t('returns.list.quickApprove')}
                          aria-label={t('returns.list.quickApprove')}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleQuickReview(item, false)}
                          loading={reviewingKey === `${item.id}:reject`}
                          icon={<FiXCircle />}
                          title={t('returns.list.quickReject')}
                          aria-label={t('returns.list.quickReject')}
                        />
                      </>
                    )}
                    <ActionButtons
                      actions={[
                        {
                          type: 'view',
                          href: `/admin/returns/${item.returnNumber}`,
                          state: { returnTo },
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
      </AdminTableCard>

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
