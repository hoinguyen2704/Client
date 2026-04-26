import { useDeferredValue, useMemo, useState, startTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiLock, FiPlus, FiUnlock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminUserService from '@/apis/services/adminUserService';
import useAuthStore from '@/stores/useAuthStore';
import { ActionButtons, AdminSearch, Button, CustomSelect, Pagination, SortableHeaderLabel, StatusBadge, TableRowSkeleton, UserAvatar } from '@/components';
import {
  AdminTable,
  AdminTableBodyRow,
  AdminTableCard,
  AdminTableCell,
  AdminTableEmptyRow,
  AdminTableHeadCell,
  AdminTableHeadRow,
  AdminTableScroll,
} from '@/components/ui/AdminTable';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { useDebounce } from '@/hooks';
import type { PageResponse, UserResponse } from '@/types';
import { downloadBlob } from '@/utils/download';
import { getApiErrorMessage } from '@/utils/error';
import { formatDate } from '@/utils/format';
import { getPaginatedRowNumber } from '@/utils/helpers';

export default function Customers() {
  const { t } = useTranslation(['adminCustomers', 'common']);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const navigate = useNavigate();
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            variant="success"
            size="md"
            icon={<FiDownload />}
            className="w-full sm:w-auto">
            {t('adminCustomers:customers.export')}
          </Button>
          <Button
            onClick={() => navigate('/admin/customers/new')}
            variant="primary"
            size="md"
            icon={<FiPlus />}
            className="w-full sm:w-auto">
            {t('adminCustomers:customers.addCustomer')}
          </Button>
        </div>
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
          className="w-full md:w-48 shrink-0" />
      </div>

      <AdminTableCard>
        <AdminTableScroll>
          <AdminTable className="min-w-[1020px]">
            <thead>
              <AdminTableHeadRow>
                <AdminTableHeadCell className="w-20 text-center">{t('adminCustomers:customers.table.index')}</AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.user')}
                    active={sortBy === 'fullName'}
                    direction={sortDir}
                    onClick={() => handleSort('fullName')}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.email')}
                    active={sortBy === 'email'}
                    direction={sortDir}
                    onClick={() => handleSort('email')}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.phone')}
                    active={sortBy === 'phoneNumber'}
                    direction={sortDir}
                    onClick={() => handleSort('phoneNumber')}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.role')}
                    active={sortBy === 'role'}
                    direction={sortDir}
                    onClick={() => handleSort('role')}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.createdAt')}
                    active={sortBy === 'createdAt'}
                    direction={sortDir}
                    onClick={() => handleSort('createdAt')}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t('adminCustomers:customers.table.status')}
                    active={sortBy === 'status'}
                    direction={sortDir}
                    onClick={() => handleSort('status')}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">{t('adminCustomers:customers.table.actions')}</AdminTableHeadCell>
              </AdminTableHeadRow>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={8} />
              ) : users.length === 0 ? (
                <AdminTableEmptyRow className="text-ink" colSpan={8}>
                  {t('adminCustomers:customers.table.empty')}
                </AdminTableEmptyRow>
              ) : (
                users.map((user, index) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <AdminTableBodyRow
                      key={user.id}
                      className={isCurrentUser ? 'bg-blue-50/60 dark:bg-blue-950/20' : undefined}
                    >
                      <AdminTableCell className="text-center font-semibold text-ink">
                        {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.fullName} src={user.avatarUrl} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{user.fullName}</span>
                              {isCurrentUser ? (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                  {t('adminCustomers:customers.badges.currentAccount')}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell className="text-ink">{user.email}</AdminTableCell>
                      <AdminTableCell className="text-ink">
                        {user.phoneNumber || t('common:labels.notAvailable')}
                      </AdminTableCell>
                      <AdminTableCell className="text-center">
                        <StatusBadge
                          status={user.role === 'ADMIN' ? 'admin' : 'user'}
                        />
                      </AdminTableCell>
                      <AdminTableCell className="text-center text-ink">
                        {formatDate(user.createdAt)}
                      </AdminTableCell>
                      <AdminTableCell className="text-center">
                        <StatusBadge
                          status={user.status === 'ACTIVE' ? 'active' : 'banned'}
                          label={
                            user.status === 'ACTIVE'
                              ? t('adminCustomers:customers.statuses.active')
                              : t('adminCustomers:customers.statuses.locked')
                          }
                        />
                      </AdminTableCell>
                      <AdminTableCell className="text-center">
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
                      </AdminTableCell>
                    </AdminTableBodyRow>
                  );
                })
              )}
            </tbody>
          </AdminTable>
        </AdminTableScroll>

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
      </AdminTableCard>
    </div>
  );
}
