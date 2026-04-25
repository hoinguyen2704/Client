import { useDeferredValue, useMemo, useState, startTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiDownload, FiLock, FiUnlock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminUserService from '@/apis/services/adminUserService';
import { ActionButtons, AdminSearch, Button, CustomSelect, Pagination, SortableHeaderLabel, StatusBadge, TableRowSkeleton, UserAvatar } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { useDebounce } from '@/hooks';
import type { PageResponse, UserResponse } from '@/types';
import { downloadBlob } from '@/utils/download';
import { getApiErrorMessage } from '@/utils/error';
import { formatDate } from '@/utils/format';
import { getPaginatedRowNumber } from '@/utils/helpers';

export default function Customers() {
  const { t } = useTranslation(['adminCustomers', 'common']);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');

  const deferredSearchInput = useDeferredValue(searchInput);
  const debouncedSearchQuery = useDebounce(deferredSearchInput, 400);
  const usersQueryKey = useMemo(
    () => ['admin-customers', debouncedSearchQuery, roleFilter, page, sortBy, sortDir],
    [debouncedSearchQuery, page, roleFilter, sortBy, sortDir],
  );

  const usersQuery = useQuery({
    queryKey: usersQueryKey,
    queryFn: ({ signal }) =>
      adminUserService.getAll({
        keyword: debouncedSearchQuery || undefined,
        role: roleFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
        sortBy,
        sortDir,
      }, { signal }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      await adminUserService.toggleStatus(userId);
      return userId;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: usersQueryKey });
      const previous = queryClient.getQueryData<PageResponse<UserResponse>>(usersQueryKey);
      queryClient.setQueryData<PageResponse<UserResponse>>(usersQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((user) =>
            user.id === userId
              ? { ...user, status: user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' }
              : user),
        };
      });
      return { previous };
    },
    onError: (error, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(usersQueryKey, context.previous);
      }
      toast.error(getApiErrorMessage(error, t, 'adminCustomers:customers.toasts.toggleFailed'));
    },
    onSuccess: () => {
      toast.success(t('adminCustomers:customers.toasts.toggleSuccess'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
  });

  const pageData = usersQuery.data || null;
  const users = pageData?.data || [];
  const loading = usersQuery.isPending && !usersQuery.data;

  const handleToggleStatus = async (id: string) => {
    await toggleStatusMutation.mutateAsync(id);
  };

  const handleSort = (column: string) => {
    startTransition(() => {
      if (sortBy === column) {
        setSortDir((current) => (current === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortBy(column);
        setSortDir('ASC');
      }
      setPage(1);
    });
  };

  const handleExport = async () => {
    try {
      const blob = await adminUserService.export({
        keyword: debouncedSearchQuery || undefined,
        role: roleFilter || undefined,
      });
      downloadBlob(blob, 'users.xlsx');
      toast.success(t('adminCustomers:customers.toasts.exportSuccess'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t, 'adminCustomers:customers.toasts.exportFailed'));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('adminCustomers:customers.title')}</h1>
        <Button
          onClick={handleExport}
          variant="success"
          size="md"
          icon={<FiDownload />}
          className="w-full sm:w-auto"
        >
          {t('adminCustomers:customers.export')}
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t('adminCustomers:customers.searchPlaceholder')}
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
          value={roleFilter}
          onChange={(value) => {
            startTransition(() => {
              setRoleFilter(value);
              setPage(1);
            });
          }}
          options={[
            { value: '', label: t('adminCustomers:customers.filters.allRoles') },
            { value: 'USER', label: t('adminCustomers:customers.filters.customer') },
            { value: 'ADMIN', label: t('adminCustomers:customers.filters.admin') },
          ]}
          className="w-full md:w-48 shrink-0"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-body text-md divide-x divide-slate-200 dark:divide-slate-700">
                <th className="p-3 sm:p-4 font-medium text-center w-20">{t('adminCustomers:customers.table.index')}</th>
                <th className="p-3 sm:p-4 font-medium">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.user')}
                    active={sortBy === 'fullName'}
                    direction={sortDir}
                    onClick={() => handleSort('fullName')}
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.email')}
                    active={sortBy === 'email'}
                    direction={sortDir}
                    onClick={() => handleSort('email')}
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.phone')}
                    active={sortBy === 'phoneNumber'}
                    direction={sortDir}
                    onClick={() => handleSort('phoneNumber')}
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium text-center">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.role')}
                    active={sortBy === 'role'}
                    direction={sortDir}
                    onClick={() => handleSort('role')}
                    align="center"
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium text-center">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.createdAt')}
                    active={sortBy === 'createdAt'}
                    direction={sortDir}
                    onClick={() => handleSort('createdAt')}
                    align="center"
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium text-center">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.status')}
                    active={sortBy === 'status'}
                    direction={sortDir}
                    onClick={() => handleSort('status')}
                    align="center"
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium text-center">{t('adminCustomers:customers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={8} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-ink border-b border-slate-200 dark:border-slate-700">
                    {t('adminCustomers:customers.table.empty')}
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors divide-x divide-slate-200 dark:divide-slate-700"
                  >
                    <td className="p-3 sm:p-4 text-center font-semibold text-ink">
                      {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} src={user.avatarUrl} />
                        <span className="font-bold">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-ink">{user.email}</td>
                    <td className="p-3 sm:p-4 text-ink">
                      {user.phoneNumber || t('common:labels.notAvailable')}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <StatusBadge
                        status={user.role === 'ADMIN' ? 'admin' : 'user'}
                      />
                    </td>
                    <td className="p-3 sm:p-4 text-ink text-center">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <StatusBadge
                        status={user.status === 'ACTIVE' ? 'active' : 'banned'}
                        label={
                          user.status === 'ACTIVE'
                            ? t('adminCustomers:customers.statuses.active')
                            : t('adminCustomers:customers.statuses.locked')
                        }
                      />
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <ActionButtons
                        actions={[
                          {
                            type: 'view',
                            href: `/admin/customers/${user.id}`,
                          },
                          {
                            type: user.status === 'ACTIVE' ? 'delete' : 'edit',
                            onClick: () => handleToggleStatus(user.id),
                            icon: user.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />,
                            title: user.status === 'ACTIVE'
                              ? t('adminCustomers:customers.actions.lock')
                              : t('adminCustomers:customers.actions.unlock'),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData ? (
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label={t('adminCustomers:customers.labels.pagination')}
            onPageChange={(nextPage) => startTransition(() => setPage(nextPage))}
          />
        ) : null}
      </div>
    </div>
  );
}
