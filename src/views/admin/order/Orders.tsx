import { useDeferredValue, useEffect, useMemo, useState, startTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiDownload, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminOrderService from '@/apis/services/adminOrderService';
import { ActionButtons, AdminSearch, Button, CustomSelect, Pagination, ReportExportModal, SortableHeaderLabel } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { getAdminOrderStatusOptions, getOrderFilterOptions } from '@/constants/orderConstants';
import { useAsyncExportJob, useDebounce, usePageQueryParam } from '@/hooks';
import type { AdminOrderListItem, PageResponse } from '@/types';
import {
  ADMIN_GRID_TABLE_HEADER_BASE_CLASS,
  ADMIN_GRID_TABLE_ROW_BASE_CLASS,
  ADMIN_GRID_TABLE_SKELETON_ROW_BASE_CLASS,
  AdminTableCard,
} from '@/components/ui/AdminTable';
import { downloadBlob } from '@/utils/download';
import { formatDate, formatPrice } from '@/utils/format';
import { getPaginatedRowNumber } from '@/utils/helpers';
import { buildReportFilename } from '@/utils/reportExport';

const ORDER_TABLE_GRID_COLUMNS = 'grid-cols-[84px_minmax(240px,1.25fr)_minmax(220px,1fr)_160px_100px_minmax(150px,1fr)_160px_220px_100px]';

export default function AdminOrders() {
  const { t } = useTranslation(['adminSales', 'common']);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isReportExportModalOpen, setIsReportExportModalOpen] = useState(false);
  const { initialPage, returnTo, syncPage } = usePageQueryParam();
  const [page, setPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  const { isExporting, startExport } = useAsyncExportJob();

  const deferredSearchInput = useDeferredValue(searchInput);
  const debouncedSearchQuery = useDebounce(deferredSearchInput, 400);
  const orderQueryKey = useMemo(
    () => ['admin-orders', debouncedSearchQuery, statusFilter, page, sortBy, sortDir],
    [debouncedSearchQuery, page, sortBy, sortDir, statusFilter],
  );

  const ordersQuery = useQuery({
    queryKey: orderQueryKey,
    queryFn: ({ signal }) =>
      adminOrderService.getList({
        keyword: debouncedSearchQuery || undefined,
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
        sortBy,
        sortDir,
      }, { signal }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
    refetchOnMount: 'always',
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (variables: { orderId: string; newStatus: string }) => {
      await adminOrderService.updateStatus(variables.orderId, variables.newStatus);
      return variables;
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: orderQueryKey });
      const previous = queryClient.getQueryData<PageResponse<AdminOrderListItem>>(orderQueryKey);
      queryClient.setQueryData<PageResponse<AdminOrderListItem>>(orderQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: newStatus }
              : order),
        };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderQueryKey, context.previous);
      }
      toast.error(t('orders.toasts.invalidTransition'));
    },
    onSuccess: () => {
      toast.success(t('orders.toasts.updated'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const pageData = ordersQuery.data || null;
  const orders = pageData?.data || [];
  const loading = ordersQuery.isPending && !ordersQuery.data;

  useEffect(() => {
    syncPage(page);
  }, [page, syncPage]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;
    await updateStatusMutation.mutateAsync({ orderId, newStatus });
  };

  const handleSort = (column: string) => {
    startTransition(() => {
      if (sortBy === column) {
        setSortDir((current) => (current === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortBy(column);
        setSortDir(column === 'createdAt' ? 'DESC' : 'ASC');
      }
      setPage(1);
    });
  };

  const handleExport = async () => {
    await startExport({
      type: 'ORDERS',
      params: {
        status: statusFilter || undefined,
        keyword: debouncedSearchQuery || undefined,
      },
      fallbackFilename: `orders_${new Date().toISOString().slice(0, 10)}.xlsx`,
      successMessage: t('orders.toasts.exportSuccess'),
      failureMessage: t('orders.toasts.exportFailed'),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('orders.title')}</h1>
        <div className="flex items-center gap-3 print:hidden shrink-0">
          <Button onClick={() => setIsReportExportModalOpen(true)} variant="success" size="md" icon={<FiDownload />}>
            {t('orders.reportExport')}
          </Button>
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />} loading={isExporting}>
            {t('orders.export')}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 p-3 shadow-sm dark:border-slate-800 sm:p-4 print:hidden flex items-center gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t('orders.searchPlaceholder')}
            value={searchInput}
            onChange={(value) => {
              startTransition(() => {
                setSearchInput(value);
                setPage(1);
              });
            }}
          />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={(value) => {
            startTransition(() => {
              setStatusFilter(value);
              setPage(1);
            });
          }}
          options={getOrderFilterOptions(t)}
          className="w-56 shrink-0"
        />
      </div>

      <AdminTableCard>
        <div className={`${ADMIN_GRID_TABLE_HEADER_BASE_CLASS} ${ORDER_TABLE_GRID_COLUMNS}`}>
          <div className="px-4 py-4">{t('orders.table.index')}</div>
          <div className="px-4 py-4 text-left">
            <SortableHeaderLabel
              label={t('orders.table.orderNumber')}
              active={sortBy === 'orderNumber'}
              direction={sortDir}
              onClick={() => handleSort('orderNumber')}
            />
          </div>
          <div className="px-4 py-4 text-left">{t('orders.table.customer')}</div>
          <div className="px-4 py-4">
            <SortableHeaderLabel
              label={t('orders.table.orderDate')}
              active={sortBy === 'createdAt'}
              direction={sortDir}
              onClick={() => handleSort('createdAt')}
              align="center"
            />
          </div>
          <div className="px-4 py-4">
            <SortableHeaderLabel
              label={t('orders.table.items')}
              active={sortBy === 'itemCount'}
              direction={sortDir}
              onClick={() => handleSort('itemCount')}
              align="center"
            />
          </div>
          <div className="px-4 py-4 text-right">
            <SortableHeaderLabel
              label={t('orders.table.total')}
              active={sortBy === 'totalAmount'}
              direction={sortDir}
              onClick={() => handleSort('totalAmount')}
              align="right"
            />
          </div>
          <div className="px-4 py-4 text-right">
            <SortableHeaderLabel
              label={t('orders.table.payment')}
              active={sortBy === 'paymentMethod'}
              direction={sortDir}
              onClick={() => handleSort('paymentMethod')}
              align="right"
            />
          </div>
          <div className="px-4 py-4">
            <SortableHeaderLabel
              label={t('orders.table.status')}
              active={sortBy === 'orderStatus'}
              direction={sortDir}
              onClick={() => handleSort('orderStatus')}
              align="center"
            />
          </div>
          <div className="px-4 py-4 text-center print:hidden">{t('orders.table.actions')}</div>
        </div>

        <div className="flex flex-col">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={`${ADMIN_GRID_TABLE_SKELETON_ROW_BASE_CLASS} ${ORDER_TABLE_GRID_COLUMNS}`}>
                <div className="flex justify-center px-4 py-4"><div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="px-4 py-4"><div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="px-4 py-4"><div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-end px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-end px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-8 w-36 rounded-xl bg-slate-200 dark:bg-slate-700" /></div>
                <div className="flex justify-center px-4 py-4"><div className="h-8 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" /></div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-subtle">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><FiPackage className="text-2xl" /></div>
              <span>{t('orders.table.empty')}</span>
            </div>
          ) : (
            orders.map((order, index) => {
              const rowNumber = getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index);
              const statusOptions = getAdminOrderStatusOptions(order.orderStatus, t);
              const customerEmail = order.customerEmail?.trim() || '-';

              return (
                <div key={order.id} className={`${ADMIN_GRID_TABLE_ROW_BASE_CLASS} ${ORDER_TABLE_GRID_COLUMNS}`}>
                  <div className="flex items-center justify-center px-4 py-4 font-semibold text-subtle">
                    {rowNumber}
                  </div>

                  <div className="flex min-w-0 items-center px-4 py-4">
                    <div className="min-w-0 break-words font-bold text-blue-600 [overflow-wrap:anywhere]">
                      {order.orderNumber}
                    </div>
                  </div>

                  <div className="min-w-0 px-4 py-4">
                    <div className="min-w-0 leading-snug">
                      <p
                        className="break-words font-medium text-body [overflow-wrap:anywhere]"
                        title={order.customerEmail?.trim() || undefined}
                      >
                        {customerEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center px-4 py-4 text-center font-medium text-body">
                    {formatDate(order.createdAt)}
                  </div>

                  <div className="flex items-center justify-center px-4 py-4">
                    <div className="font-medium text-body">
                      {order.itemCount || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-end px-4 py-4">
                    <div className="font-bold text-ink">{formatPrice(order.totalAmount)}</div>
                  </div>

                  <div className="flex items-center justify-end px-4 py-4 text-center">
                    <div className="font-medium text-body">
                      {order.paymentMethod}
                    </div>
                  </div>

                  <div className="flex items-center justify-center px-4 py-4">
                    <div className="w-[150px]">
                      <CustomSelect
                        value={order.orderStatus}
                        onChange={(value) => handleStatusChange(order.id, value)}
                        options={statusOptions}
                        className="w-full"
                        disabled={statusOptions.length <= 1}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center px-4 py-4 print:hidden">
                    <ActionButtons
                      actions={[
                        {
                          type: 'view',
                          href: `/admin/orders/${order.orderNumber}`,
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

        {pageData ? (
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label={t('orders.table.label')}
            onPageChange={(nextPage) => startTransition(() => setPage(nextPage))}
          />
        ) : null}
      </AdminTableCard>

      <ReportExportModal
        open={isReportExportModalOpen}
        onClose={() => setIsReportExportModalOpen(false)}
        onSubmit={async (params) => {
          try {
            const blob = await adminOrderService.exportReportByRange({
              ...params,
              status: statusFilter || undefined,
              keyword: debouncedSearchQuery || undefined,
            });
            downloadBlob(blob, buildReportFilename('orders_report', params));
            toast.success(t('orders.toasts.exportSuccess'));
          } catch (error) {
            console.error(error);
            toast.error(t('orders.toasts.exportFailed'));
            throw error;
          }
        }}
      />
    </div>
  );
}
