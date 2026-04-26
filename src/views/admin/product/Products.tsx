import { useDeferredValue, useEffect, useMemo, useState, startTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiDownload, FiPlus, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminCategoryService from '@/apis/services/adminCategoryService';
import adminProductService from '@/apis/services/adminProductService';
import { ActionButtons, AdminSearch, Button, Checkbox, ConfirmDialog, CustomSelect, Pagination, PrimaryButton, SortableHeaderLabel, StatusBadge, TableRowSkeleton } from '@/components';
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
import type { AdminProductListItem, CategoryResponse, PageResponse } from '@/types';
import { downloadBlob } from '@/utils/download';
import { getApiErrorMessage } from '@/utils/error';
import { formatPrice } from '@/utils/format';
import { getPaginatedRowNumber } from '@/utils/helpers';

type DeleteDialogState =
  | { mode: 'single'; id: string; name: string }
  | { mode: 'bulk'; ids: string[]; count: number }
  | null;

export default function Products() {
  const { t } = useTranslation(['adminCatalog', 'common']);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null);

  const deferredSearchInput = useDeferredValue(searchInput);
  const debouncedSearchQuery = useDebounce(deferredSearchInput, 400);
  const productQueryKey = useMemo(
    () => ['admin-products', debouncedSearchQuery, statusFilter, categoryFilter, page, sortBy, sortDir],
    [categoryFilter, debouncedSearchQuery, page, sortBy, sortDir, statusFilter],
  );

  const categoriesQuery = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: ({ signal }) =>
      adminCategoryService.getAll({ size: PAGE_SIZE.LARGE }, { signal }).then((res) => res.data?.data || []),
    staleTime: 5 * 60_000,
  });

  const productsQuery = useQuery({
    queryKey: productQueryKey,
    queryFn: ({ signal }) =>
      adminProductService.getList({
        keyword: debouncedSearchQuery || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        page,
        size: PAGE_SIZE.LARGE,
        sortBy,
        sortDir,
      }, { signal }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminProductService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productQueryKey });
      const previous = queryClient.getQueryData<PageResponse<AdminProductListItem>>(productQueryKey);
      queryClient.setQueryData<PageResponse<AdminProductListItem>>(productQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((product) => product.id !== id),
          total: Math.max(0, current.total - 1),
        };
      });
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productQueryKey, context.previous);
      }
      toast.error(getApiErrorMessage(error, t, 'adminCatalog:products.toasts.deleteFailed'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (variables: { id: string; currentStatus: string }) => {
      const response = await adminProductService.toggleStatus(variables.id);
      return {
        id: variables.id,
        nextStatus: response.data?.status || (variables.currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'),
      };
    },
    onMutate: async ({ id, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: productQueryKey });
      const previous = queryClient.getQueryData<PageResponse<AdminProductListItem>>(productQueryKey);
      const optimisticStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      queryClient.setQueryData<PageResponse<AdminProductListItem>>(productQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((product) =>
            product.id === id
              ? { ...product, status: optimisticStatus }
              : product),
        };
      });
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productQueryKey, context.previous);
      }
      toast.error(getApiErrorMessage(error, t, 'adminCatalog:products.toasts.toggleFailed'));
    },
    onSuccess: ({ id, nextStatus }) => {
      queryClient.setQueryData<PageResponse<AdminProductListItem>>(productQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((product) =>
            product.id === id
              ? { ...product, status: nextStatus }
              : product),
        };
      });
      toast.success(t('adminCatalog:products.toasts.toggleSuccess'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const categories = categoriesQuery.data || [];
  const pageData = productsQuery.data || null;
  const products = pageData?.data || [];
  const loading = productsQuery.isPending && !productsQuery.data;

  useEffect(() => {
    const visibleIds = new Set(products.map((product) => product.id));
    setSelectedItems((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [products]);

  const handleSort = (column: string) => {
    startTransition(() => {
      if (sortBy === column) {
        setSortDir((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortBy(column);
        setSortDir('ASC');
      }
      setPage(1);
    });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ mode: 'single', id, name });
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    await toggleMutation.mutateAsync({ id, currentStatus });
  };

  const handleExport = async () => {
    try {
      const blob = await adminProductService.export({
        keyword: debouncedSearchQuery || undefined,
        categoryId: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      downloadBlob(blob, `products_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(t('adminCatalog:products.toasts.exportSuccess'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t, 'adminCatalog:products.toasts.exportFailed'));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? products.map((product) => product.id) : []);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => (
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    ));
  };

  const handleDeleteSelected = () => {
    setDeleteDialog({
      mode: 'bulk',
      ids: [...selectedItems],
      count: selectedItems.length,
    });
  };

  const handleConfirmDelete = async () => {
    const currentDialog = deleteDialog;
    if (!currentDialog) return;

    setDeleteDialog(null);

    if (currentDialog.mode === 'single') {
      await deleteMutation.mutateAsync(currentDialog.id);
      toast.success(t('adminCatalog:products.toasts.deleteSuccess'));
      return;
    }

    const toDelete = [...currentDialog.ids];
    const results = await Promise.allSettled(toDelete.map((id) => deleteMutation.mutateAsync(id)));
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    setSelectedItems([]);

    if (successCount === toDelete.length) {
      toast.success(t('adminCatalog:products.toasts.deleteManySuccess', { count: successCount }));
      return;
    }

    toast.warning(t('adminCatalog:products.toasts.deleteManyPartial', {
      success: successCount,
      total: toDelete.length,
    }));
  };

  const getStatusLabel = (status: string) => {
    if (status === 'ACTIVE') return t('adminCatalog:products.filters.active');
    if (status === 'DRAFT') return t('adminCatalog:products.filters.draft');
    if (status === 'INACTIVE') return t('adminCatalog:products.filters.inactive');
    return status;
  };

  const getStatusBadgeKey = (status: string) => {
    if (status === 'ACTIVE') return 'active';
    if (status === 'DRAFT') return 'draft';
    if (status === 'INACTIVE') return 'hidden';
    return status;
  };

  const getToggleTitle = (status: string) => (
    status === 'ACTIVE'
      ? t('adminCatalog:products.statusActions.moveToDraft')
      : t('adminCatalog:products.statusActions.activate')
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('adminCatalog:products.title')}</h1>
          {selectedItems.length > 0 ? (
            <p className="text-md text-muted mt-1">
              {t('adminCatalog:products.selectedCount', { count: selectedItems.length })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {selectedItems.length > 0 ? (
            <Button
              onClick={handleDeleteSelected}
              variant="danger"
              size="md"
              icon={<FiTrash2 />}
            >
              {t('adminCatalog:products.actions.deleteSelected', { count: selectedItems.length })}
            </Button>
          ) : null}
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />}>
            {t('adminCatalog:products.actions.exportExcel')}
          </Button>
          <PrimaryButton href="/admin/products/new" icon={<FiPlus className="text-base" />}>
            {t('adminCatalog:products.actions.addProduct')}
          </PrimaryButton>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t('adminCatalog:products.filters.searchPlaceholder')}
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
          value={categoryFilter}
          onChange={(value) => {
            startTransition(() => {
              setCategoryFilter(value);
              setPage(1);
            });
          }}
          options={[
            { value: '', label: t('adminCatalog:products.filters.allCategories') },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
          ]}
          className="w-full md:w-56"
        />
        <CustomSelect
          value={statusFilter}
          onChange={(value) => {
            startTransition(() => {
              setStatusFilter(value);
              setPage(1);
            });
          }}
          options={[
            { value: '', label: t('adminCatalog:products.filters.allStatuses') },
            { value: 'ACTIVE', label: t('adminCatalog:products.filters.active') },
            { value: 'DRAFT', label: t('adminCatalog:products.filters.draft') },
            { value: 'INACTIVE', label: t('adminCatalog:products.filters.inactive') },
          ]}
          className="w-full md:w-48"
        />
      </div>

      <AdminTableCard>
        <AdminTableScroll>
          <AdminTable className="min-w-[1000px]">
            <thead>
              <AdminTableHeadRow>
                <AdminTableHeadCell className="w-20 text-center">{t('adminCatalog:products.table.index')}</AdminTableHeadCell>
                <AdminTableHeadCell className="w-10 text-center">
                  <Checkbox
                    checked={selectedItems.length === products.length && products.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t('adminCatalog:products.table.product')}
                    active={sortBy === 'name'}
                    direction={sortDir}
                    onClick={() => handleSort('name')}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell>{t('adminCatalog:products.table.category')}</AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t('adminCatalog:products.table.price')}
                    active={sortBy === 'originPrice'}
                    direction={sortDir}
                    onClick={() => handleSort('originPrice')}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t('adminCatalog:products.table.stock')}
                    active={sortBy === 'totalStock'}
                    direction={sortDir}
                    onClick={() => handleSort('totalStock')}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t('adminCatalog:products.table.sold')}
                    active={sortBy === 'totalSold'}
                    direction={sortDir}
                    onClick={() => handleSort('totalSold')}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t('adminCatalog:products.table.status')}
                    active={sortBy === 'status'}
                    direction={sortDir}
                    onClick={() => handleSort('status')}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">{t('adminCatalog:products.table.actions')}</AdminTableHeadCell>
              </AdminTableHeadRow>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={9} />
              ) : products.length === 0 ? (
                <AdminTableEmptyRow colSpan={9}>
                  {t('adminCatalog:products.table.empty')}
                </AdminTableEmptyRow>
              ) : (
                products.map((product, index) => {
                  const stock = product.totalStock ?? 0;
                  const rowNumber = getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index);
                  return (
                    <AdminTableBodyRow key={product.id}>
                      <AdminTableCell className="text-center font-semibold text-ink">{rowNumber}</AdminTableCell>
                      <AdminTableCell>
                        <Checkbox
                          checked={selectedItems.includes(product.id)}
                          onCheckedChange={() => handleSelectItem(product.id)}
                        />
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.mainImageUrl || '/placeholder.png'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                          />
                          <div>
                            <span className="font-bold line-clamp-1 max-w-[380px]">{product.name}</span>
                            <span className="text-sm text-subtle block">{product.brandName || ''}</span>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell className="text-muted">{product.categoryName || t('common:labels.notAvailable')}</AdminTableCell>
                      <AdminTableCell className="font-bold text-ink">{formatPrice(product.lowestPrice ?? product.originPrice)}</AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${stock === 0 ? 'text-red-500' : stock < 10 ? 'text-orange-500' : ''}`}>{stock}</span>
                          {stock < 10 && stock > 0 ? <StatusBadge status="low_stock" /> : null}
                          {stock === 0 ? <StatusBadge status="out_of_stock" /> : null}
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className={`font-semibold ${(product.totalSold ?? 0) > 50 ? 'text-emerald-600' : (product.totalSold ?? 0) > 0 ? 'text-body' : 'text-subtle'}`}>
                          {product.totalSold ?? 0}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <StatusBadge
                          status={getStatusBadgeKey(product.status)}
                          label={getStatusLabel(product.status)}
                        />
                      </AdminTableCell>
                      <AdminTableCell className="text-right">
                        <ActionButtons
                          actions={[
                            {
                              type: 'more',
                              title: getToggleTitle(product.status),
                              icon: product.status === 'ACTIVE'
                                ? <FiToggleRight className="text-[1.5rem] text-green-500" />
                                : <FiToggleLeft className="text-[1.5rem]" />,
                              onClick: () => handleToggleStatus(product.id, product.status),
                            },
                            {
                              type: 'edit',
                              href: `/admin/products/${product.id}`,
                            },
                            {
                              type: 'delete',
                              onClick: () => handleDelete(product.id, product.name),
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
            label={t('adminCatalog:products.labels.pagination')}
            onPageChange={(nextPage) => startTransition(() => setPage(nextPage))}
          />
        ) : null}
      </AdminTableCard>

      <ConfirmDialog
        open={!!deleteDialog}
        title={
          deleteDialog?.mode === 'bulk'
            ? t('adminCatalog:products.deleteDialog.bulkTitle')
            : t('adminCatalog:products.deleteDialog.title')
        }
        message={
          deleteDialog?.mode === 'bulk'
            ? t('adminCatalog:products.deleteDialog.bulkMessage', { count: deleteDialog.count })
            : t('adminCatalog:products.deleteDialog.message', { name: deleteDialog?.name || '' })
        }
        confirmLabel={
          deleteDialog?.mode === 'bulk'
            ? t('adminCatalog:products.actions.deleteAll')
            : t('adminCatalog:products.deleteDialog.confirm')
        }
        cancelLabel={t('adminCatalog:products.deleteDialog.cancel')}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
