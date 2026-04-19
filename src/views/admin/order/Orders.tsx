import { useDeferredValue, useMemo, useState, startTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiDownload, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminOrderService from '@/apis/services/adminOrderService';
import { ActionButtons, AdminSearch, Button, CustomSelect, Pagination } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { getAdminOrderStatusOptions, getOrderFilterOptions } from '@/constants/orderConstants';
import { useDebounce } from '@/hooks';
import type { AdminOrderListItem, PageResponse } from '@/types';
import { downloadBlob } from '@/utils/download';
import { formatDate, formatPrice } from '@/utils/format';
import { getPaginatedRowNumber } from '@/utils/helpers';

export default function AdminOrders() {
  const { t } = useTranslation(['adminSales', 'common']);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const deferredSearchInput = useDeferredValue(searchInput);
  const debouncedSearchQuery = useDebounce(deferredSearchInput, 400);
  const orderQueryKey = useMemo(
    () => ['admin-orders', debouncedSearchQuery, statusFilter, page],
    [debouncedSearchQuery, page, statusFilter],
  );

  const ordersQuery = useQuery({
    queryKey: orderQueryKey,
    queryFn: ({ signal }) =>
      adminOrderService.getList({
        keyword: debouncedSearchQuery || undefined,
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
      }, { signal }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;
    await updateStatusMutation.mutateAsync({ orderId, newStatus });
  };

  const handleExport = async () => {
    try {
      const blob = await adminOrderService.export({
        status: statusFilter || undefined,
        keyword: debouncedSearchQuery || undefined,
      });
      downloadBlob(blob, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('orders.title')}</h1>
        <div className="flex gap-3 print:hidden">
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />}>
            {t('orders.export')}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4 print:hidden">
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
          className="w-full md:w-56"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="hidden lg:grid grid-cols-[84px_350px_180px_100px_minmax(150px,1fr)_200px_220px_100px] divide-x divide-slate-200 dark:divide-slate-700 gap-0 bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md font-semibold text-center rounded-t-2xl">
          <div className="px-4 py-4">{t('orders.table.index')}</div>
          <div className="px-4 py-4 text-left">{t('orders.table.orderNumber')}</div>
          <div className="px-4 py-4">{t('orders.table.orderDate')}</div>
          <div className="px-4 py-4">{t('orders.table.items')}</div>
          <div className="px-4 py-4 text-right">{t('orders.table.total')}</div>
          <div className="px-4 py-4 text-right">{t('orders.table.payment')}</div>
          <div className="px-4 py-4">{t('orders.table.status')}</div>
          <div className="px-4 py-4 text-center print:hidden">{t('orders.table.actions')}</div>
        </div>

        <div className="flex flex-col">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col lg:grid lg:grid-cols-[84px_350px_180px_100px_minmax(150px,1fr)_200px_220px_100px] lg:divide-x divide-slate-200 dark:divide-slate-700 items-center border-b border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="hidden lg:flex px-4 py-4 w-full justify-center"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-end hidden lg:flex"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-end hidden lg:flex"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" /></div>
                <div className="px-4 py-4 w-full flex justify-center hidden lg:flex"><div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" /></div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><FiPackage className="text-2xl" /></div>
              <span>{t('orders.table.empty')}</span>
            </div>
          ) : (
            orders.map((order, index) => {
              const rowNumber = getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index);
              const statusOptions = getAdminOrderStatusOptions(order.orderStatus, t);

              return (
                <div key={order.id} className="group relative flex flex-col lg:grid lg:grid-cols-[84px_350px_180px_100px_minmax(150px,1fr)_200px_220px_100px] lg:divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <div className="hidden lg:flex items-center justify-center px-4 py-4 h-full font-semibold text-slate-400">
                    {rowNumber}
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-start items-center px-4 py-3 lg:px-4 lg:py-4 lg:h-full">
                    <div className="font-bold text-purple-600 flex items-center gap-2">
                      <span className="inline-flex lg:hidden items-center justify-center min-w-9 h-8 px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-semibold">
                        {rowNumber}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 lg:hidden"><FiPackage className="text-md" /></div>
                      {order.orderNumber}
                    </div>
                    <div className="lg:hidden text-slate-500 text-md ">{formatDate(order.createdAt)}</div>
                  </div>

                  <div className="hidden lg:flex justify-center items-center px-4 py-4 text-slate-700 dark:text-slate-300 font-medium h-full text-center">{formatDate(order.createdAt)}</div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-center items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">{t('orders.table.quantityMobile')}</span>
                    <div className="font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 lg:px-0 lg:py-0 lg:bg-transparent lg:dark:bg-transparent rounded-full text-sm lg:text-md w-max text-slate-700 dark:text-slate-300">
                      {order.itemCount || 0}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-end items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">{t('orders.table.totalMobile')}</span>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{formatPrice(order.totalAmount)}</div>
                  </div>

                  <div className="w-full lg:w-auto flex justify-between lg:justify-end items-center px-4 py-2 lg:px-4 lg:py-4 lg:h-full text-center">
                    <span className="lg:hidden text-slate-500 text-md">{t('orders.table.paymentMobile')}</span>
                    <div className="text-slate-700 dark:text-slate-300 font-medium px-2 py-1 lg:px-0 lg:py-0 bg-slate-100 dark:bg-slate-800 lg:bg-transparent lg:dark:bg-transparent rounded-md text-sm lg:text-md w-max border lg:border-none border-slate-200 dark:border-slate-700">
                      {order.paymentMethod}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto mt-1 lg:mt-0 flex justify-between lg:justify-center items-center px-4 py-3 lg:px-4 lg:py-4 lg:h-full">
                    <span className="lg:hidden text-slate-500 text-md">{t('orders.table.statusMobile')}</span>
                    <div className="w-[170px] sm:w-48 lg:w-[150px]">
                      <CustomSelect
                        value={order.orderStatus}
                        onChange={(value) => handleStatusChange(order.id, value)}
                        options={statusOptions}
                        className="w-full"
                        disabled={statusOptions.length <= 1}
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-auto mt-2 lg:mt-0 flex justify-end lg:justify-center items-center print:hidden px-4 pb-4 pt-2 lg:px-4 lg:py-4 lg:h-full">
                    <ActionButtons
                      actions={[
                        {
                          type: 'view',
                          href: `/admin/orders/${order.orderNumber}`,
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
      </div>
    </div>
  );
}
