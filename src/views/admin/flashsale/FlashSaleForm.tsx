import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiZap, FiArrowLeft, FiPlus, FiCheck, FiSave, FiClock, FiTrendingDown, FiAlertTriangle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { adminFlashSaleService } from '@/apis';
import type { FlashSaleItemForm } from '@/types';
import { PrimaryButton, Button, TrashButton, FormInput, FormTextarea, Pagination, SortableHeaderLabel } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import type { SelectedVariant } from '@/components';
import { formatDateTime, formatPrice } from '@/utils/format';
import {
  clampNonNegativeInteger,
  parseRequiredIntegerInputValue,
} from '@/utils/numericInput';
import { resolveVariantSalesMetrics } from '@/utils/variantSales';
import {
  AdminTable,
  AdminTableBodyRow,
  AdminTableCell,
  AdminTableEmptyRow,
  AdminTableHeadCell,
  AdminTableHeadRow,
  AdminTableScroll,
} from '@/components/ui/AdminTable';
import { useClientTableSort } from '@/hooks';
import { PICKER_RESULT_KEY } from './ProductPicker';

const ITEMS_PER_PAGE = PAGE_SIZE.MEDIUM;
const getFlashSaleItemKey = (item: FlashSaleItemForm) => item.id ?? item.variantId;
const resolveMaxFlashStock = (item: Pick<FlashSaleItemForm, 'stockQuantity'>) => {
  const stock = Number(item.stockQuantity);
  if (!Number.isFinite(stock) || stock < 0) return undefined;
  return Math.trunc(stock);
};
const clampFlashStock = (value: number, item: Pick<FlashSaleItemForm, 'stockQuantity'>) => {
  const maxStock = resolveMaxFlashStock(item);
  return clampNonNegativeInteger(value, maxStock);
};

interface FlashSaleItemRowProps {
  item: FlashSaleItemForm;
  itemKey: string;
  variantFallback: string;
  historyEmptyLabel: string;
  historyLabel: string;
  stockLabel: string;
  priceWarningTitle: string;
  stockWarningTitle: string;
  onChangeFlashPrice: (itemKey: string, rawValue: string) => void;
  onChangeFlashStock: (itemKey: string, rawValue: string) => void;
  onRemove: (itemKey: string) => void;
}

const FlashSaleItemRow = memo(function FlashSaleItemRow({
  item,
  itemKey,
  variantFallback,
  historyEmptyLabel,
  historyLabel,
  stockLabel,
  priceWarningTitle,
  stockWarningTitle,
  onChangeFlashPrice,
  onChangeFlashStock,
  onRemove,
}: FlashSaleItemRowProps) {
  const sales = useMemo(() => resolveVariantSalesMetrics(item), [item]);
  const historyText = historyLabel
    .replace('{{gross}}', sales.gross.toLocaleString())
    .replace('{{returned}}', sales.returned.toLocaleString())
    .replace('{{net}}', sales.net.toLocaleString());
  const stockText = stockLabel.replace('{{stock}}', (item.stockQuantity ?? 0).toLocaleString());
  const originalPrice = Number(item.originalPrice) || 0;
  const flashPrice = Number(item.flashPrice) || 0;
  const flashStock = Number(item.flashStock);
  const maxStock = resolveMaxFlashStock(item);
  const hasPriceWarning = flashPrice <= 0 || flashPrice > originalPrice;
  const hasStockWarning = flashStock <= 0 || (maxStock != null && flashStock > maxStock);

  return (
    <AdminTableBodyRow>
      <AdminTableCell>
        <div className="flex items-center gap-3">
          <img
            src={item.imageUrl || '/placeholder.png'}
            alt=""
            className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-700 flex-shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="font-medium text-body truncate" title={item.productName}>
              {item.productName}
            </div>
            <div className="text-sm text-muted">
              {item.variantName || variantFallback}
            </div>
          </div>
        </div>
      </AdminTableCell>
      <AdminTableCell className="text-muted">{formatPrice(item.originalPrice)}</AdminTableCell>
      <AdminTableCell>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={`w-full rounded-lg border bg-slate-50 px-3 py-1.5 pr-9 transition-all focus:outline-none focus:ring-2 dark:bg-slate-800 ${
              hasPriceWarning
                ? 'border-amber-300 focus:ring-amber-500/20 dark:border-amber-500/50'
                : 'border-slate-200 focus:ring-primary-500/20 dark:border-slate-700'
            }`}
            value={String(item.flashPrice)}
            onChange={(e) => onChangeFlashPrice(itemKey, e.target.value)}
          />
          {hasPriceWarning && (
            <FiAlertTriangle
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500"
              title={priceWarningTitle}
              aria-label={priceWarningTitle}
            />
          )}
        </div>
      </AdminTableCell>
      <AdminTableCell>
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={`w-full rounded-lg border bg-slate-50 px-3 py-1.5 pr-9 transition-all focus:outline-none focus:ring-2 dark:bg-slate-800 ${
                hasStockWarning
                  ? 'border-amber-300 focus:ring-amber-500/20 dark:border-amber-500/50'
                  : 'border-slate-200 focus:ring-primary-500/20 dark:border-slate-700'
              }`}
              value={String(item.flashStock)}
              onChange={(e) => onChangeFlashStock(itemKey, e.target.value)}
            />
            {hasStockWarning && (
              <FiAlertTriangle
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500"
                title={stockWarningTitle}
                aria-label={stockWarningTitle}
              />
            )}
          </div>
          <div className="text-sm text-muted leading-tight">
            {item.grossSoldQty === undefined && item.stockQuantity === undefined ? (
              <div>{historyEmptyLabel}</div>
            ) : (
              <>
                <div>{historyText}</div>
                <div>{stockText}</div>
              </>
            )}
          </div>
        </div>
      </AdminTableCell>
      <AdminTableCell className="text-center">
        <TrashButton onClick={() => onRemove(itemKey)} />
      </AdminTableCell>
    </AdminTableBodyRow>
  );
});

export default function FlashSaleForm() {
  const { t } = useTranslation(['adminCatalog', 'common']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const returnTo = typeof location.state?.returnTo === 'string'
    ? location.state.returnTo
    : '/admin/flash-sales';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [itemsPage, setItemsPage] = useState(1);
  const [isEditLoaded, setIsEditLoaded] = useState(!id);
  const [form, setForm] = useState<{
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    items: FlashSaleItemForm[];
  }>({ name: '', startTime: '', endTime: '', items: [] });
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  const invalidateFlashSaleQueries = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['admin-list', 'admin-flash-sales'],
      refetchType: 'all',
    });
  }, [queryClient]);

  // Load existing flash sale data when editing
  useEffect(() => {
    if (!id) {
      setIsEditLoaded(true);
      return;
    }
    const load = async () => {
      setIsEditLoaded(false);
      setLoading(true);
      try {
        const res = await adminFlashSaleService.getById(id);
        const sale = res.data;
        if (sale) {
          setForm({
            name: sale.name,
            description: sale.description || '',
            startTime: sale.startTime?.slice(0, 16) || '',
            endTime: sale.endTime?.slice(0, 16) || '',
            items: sale.items?.map(i => ({
              id: i.id,
              variantId: i.variantId,
              productName: i.productName,
              variantName: i.variantName || t('productPicker.variantFallback'),
              originalPrice: i.originalPrice,
              imageUrl: i.imageUrl || '',
              flashPrice: i.flashPrice,
              flashStock: clampFlashStock(i.flashStock, i),
              grossSoldQty: i.grossSoldQty,
              returnedQty: i.returnedQty,
              netSoldQty: i.netSoldQty,
              stockQuantity: i.stockQuantity,
            })) || [],
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(t('flashSales.toasts.loadFailed'));
        navigate(returnTo);
      } finally {
        setLoading(false);
        setIsEditLoaded(true);
      }
    };
    load();
  }, [id, navigate]);

  // Receive selected variants back from ProductPicker page
  useEffect(() => {
    const pickerResult = location.state?.[PICKER_RESULT_KEY] as SelectedVariant[] | undefined;
    if (!pickerResult || pickerResult.length === 0) return;
    if (id && !isEditLoaded) return;

    setForm(prev => {
      const existingVariantIds = new Set(prev.items.map(i => i.variantId));
      const dedupedSelections = pickerResult.filter(v => !existingVariantIds.has(v.variantId));
      if (dedupedSelections.length === 0) {
        return prev;
      }

      const newItems: FlashSaleItemForm[] = dedupedSelections.map(v => ({
        variantId: v.variantId,
        productName: v.productName,
        variantName: v.variantName,
        originalPrice: v.originalPrice,
        imageUrl: v.imageUrl,
        flashPrice: v.originalPrice,
        flashStock: 0,
        grossSoldQty: v.grossSoldQty,
        returnedQty: v.returnedQty,
        netSoldQty: v.netSoldQty,
        stockQuantity: v.stockQuantity,
      }));

      return { ...prev, items: [...prev.items, ...newItems] };
    });
    // Clear state to avoid accidental re-append
    navigate(location.pathname, { replace: true, state: { returnTo } });
  }, [id, isEditLoaded, location.pathname, location.state, navigate, returnTo]);

  const handleOpenPicker = useCallback(() => {
    const pickerPath = isEditing && id
      ? `/admin/flash-sales/${id}/pick-products`
      : '/admin/flash-sales/pick-products';

    navigate(pickerPath, {
      state: {
        initialSelectedIds: form.items.map(i => i.variantId),
        returnTo: isEditing ? `/admin/flash-sales/${id}/edit` : '/admin/flash-sales/new',
        listReturnTo: returnTo,
      },
    });
  }, [form.items, id, isEditing, navigate, returnTo]);

  const handleRemoveItem = useCallback((itemKey: string) => {
    setForm(prev => {
      const items = prev.items.filter((item) => getFlashSaleItemKey(item) !== itemKey);
      return { ...prev, items };
    });
  }, []);

  const handleChangeItem = useCallback((itemKey: string, field: 'flashPrice' | 'flashStock', value: number) => {
    setForm(prev => {
      const items = prev.items.map((item) => (
        getFlashSaleItemKey(item) === itemKey
          ? {
            ...item,
            [field]: field === 'flashStock' ? clampFlashStock(value, item) : value,
          }
          : item
      ));
      return { ...prev, items };
    });
  }, []);

  const handleChangeFlashStock = useCallback((itemKey: string, rawValue: string) => {
    const parsedValue = parseRequiredIntegerInputValue(rawValue);
    const item = form.items.find((entry) => getFlashSaleItemKey(entry) === itemKey);
    const maxStock = item ? resolveMaxFlashStock(item) : undefined;
    const nextValue = maxStock != null && parsedValue > maxStock ? maxStock : parsedValue;
    if (maxStock != null && parsedValue > maxStock) {
      toast.warning(t('flashSales.form.stockExceeded', { stock: maxStock.toLocaleString() }));
    }
    handleChangeItem(itemKey, 'flashStock', nextValue);
  }, [form.items, handleChangeItem, t]);

  const handleChangeFlashPrice = useCallback((itemKey: string, rawValue: string) => {
    const parsedValue = parseRequiredIntegerInputValue(rawValue);
    const item = form.items.find((entry) => getFlashSaleItemKey(entry) === itemKey);
    const originalPrice = Math.trunc(Number(item?.originalPrice) || 0);
    const nextValue = originalPrice > 0 && parsedValue > originalPrice ? originalPrice : parsedValue;
    if (originalPrice > 0 && parsedValue > originalPrice) {
      toast.warning(t('flashSales.form.priceExceeded', { price: formatPrice(originalPrice) }));
    }
    handleChangeItem(itemKey, 'flashPrice', nextValue);
  }, [form.items, handleChangeItem, t]);

  const handleSubmit = async () => {
    // Basic validation
    if (!form.name.trim()) {
      toast.error(t('flashSales.toasts.nameRequired'));
      return;
    }
    if (!form.startTime || !form.endTime) {
      toast.error(t('flashSales.toasts.timeRequired'));
      return;
    }
    if (form.items.length === 0) {
      toast.error(t('flashSales.toasts.itemsRequired'));
      return;
    }
    if (invalidTimeRange) {
      toast.error(t('flashSales.form.validationTime'));
      return;
    }
    if (invalidPriceCount > 0) {
      toast.error(t('flashSales.form.validationPrice', { count: invalidPriceCount }));
      return;
    }
    if (invalidStockCount > 0) {
      toast.error(t('flashSales.form.validationStock', { count: invalidStockCount }));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: form.items.map(i => ({
          variantId: i.variantId,
          flashPrice: i.flashPrice,
          flashStock: i.flashStock,
        })),
      };

      if (isEditing) {
        await adminFlashSaleService.update(id!, payload);
        await invalidateFlashSaleQueries();
        toast.success(t('flashSales.toasts.updateSuccess'));
        return;
      } else {
        await adminFlashSaleService.create(payload);
        await invalidateFlashSaleQueries();
        toast.success(t('flashSales.toasts.createSuccess'));
        navigate('/admin/flash-sales');
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, translate, 'adminCatalog:flashSales.toasts.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const startDate = useMemo(() => form.startTime ? new Date(form.startTime) : null, [form.startTime]);
  const endDate = useMemo(() => form.endTime ? new Date(form.endTime) : null, [form.endTime]);
  const now = useMemo(() => new Date(), []);

  const scheduleStatus = useMemo(() => {
    if (!startDate || !endDate) return t('flashSales.form.schedule.incomplete');
    if (endDate <= startDate) return t('flashSales.form.schedule.invalid');
    if (now < startDate) return t('flashSales.form.schedule.scheduled');
    if (now >= startDate && now <= endDate) return t('flashSales.form.schedule.active');
    return t('flashSales.form.schedule.ended');
  }, [endDate, now, startDate, t]);

  const {
    totalStock,
    totalOriginalValue,
    totalFlashValue,
    invalidPriceCount,
    invalidStockCount,
  } = useMemo(() => form.items.reduce(
    (summary, item) => {
      const flashStock = Number(item.flashStock);
      const normalizedFlashStock = Math.max(0, flashStock || 0);
      const originalPrice = Number(item.originalPrice) || 0;
      const flashPrice = Number(item.flashPrice) || 0;
      const maxStock = resolveMaxFlashStock(item);

      summary.totalStock += normalizedFlashStock;
      summary.totalOriginalValue += originalPrice * normalizedFlashStock;
      summary.totalFlashValue += flashPrice * normalizedFlashStock;
      if (flashPrice <= 0 || flashPrice > originalPrice) {
        summary.invalidPriceCount += 1;
      }
      if (flashStock <= 0 || (maxStock != null && flashStock > maxStock)) {
        summary.invalidStockCount += 1;
      }
      return summary;
    },
    {
      totalStock: 0,
      totalOriginalValue: 0,
      totalFlashValue: 0,
      invalidPriceCount: 0,
      invalidStockCount: 0,
    },
  ), [form.items]);
  const totalDiscountValue = Math.max(0, totalOriginalValue - totalFlashValue);
  const discountRate = totalOriginalValue > 0 ? Math.round((totalDiscountValue / totalOriginalValue) * 100) : 0;

  const invalidTimeRange = !!(startDate && endDate && endDate <= startDate);
  const hasWarnings = invalidTimeRange || invalidPriceCount > 0 || invalidStockCount > 0;
  const sortAccessors = useMemo(() => ({
    productName: (item: FlashSaleItemForm) => item.productName || '',
    originalPrice: (item: FlashSaleItemForm) => Number(item.originalPrice ?? 0),
    flashPrice: (item: FlashSaleItemForm) => Number(item.flashPrice ?? 0),
    flashStock: (item: FlashSaleItemForm) => Number(item.flashStock ?? 0),
  }), []);
  const {
    sortedItems,
    sortBy,
    sortDir,
    toggleSort,
  } = useClientTableSort(form.items, {
    sortAccessors,
  });

  const itemsTotalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const startIndex = (itemsPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = useMemo(
    () => sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [sortedItems, startIndex],
  );
  const tableLabels = useMemo(() => ({
    variantFallback: t('productPicker.variantFallback'),
    historyEmpty: t('flashSales.form.historyEmpty'),
    historyLabel: t('flashSales.form.historyLabel', {
      gross: '{{gross}}',
      returned: '{{returned}}',
      net: '{{net}}',
      interpolation: { escapeValue: false },
    }),
    stockLabel: t('flashSales.form.stockLabel', {
      stock: '{{stock}}',
      interpolation: { escapeValue: false },
    }),
    priceWarningTitle: t('flashSales.form.validationPrice', { count: 1 }),
    stockWarningTitle: t('flashSales.form.validationStock', { count: 1 }),
  }), [t]);

  useEffect(() => {
    if (itemsPage > itemsTotalPages) {
      setItemsPage(itemsTotalPages);
    }
  }, [itemsPage, itemsTotalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-subtle">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-yellow-500 rounded-full animate-spin" />
          {t('flashSales.form.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(returnTo)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted hover:text-body"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
              <FiZap className="text-yellow-500" />
              {isEditing ? t('flashSales.form.editTitle') : t('flashSales.form.createTitle')}
            </h1>
            <p className="text-sm text-muted mt-0.5">
              {isEditing
                ? t('flashSales.form.editDescription')
                : t('flashSales.form.createDescription')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => navigate(returnTo)}
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-none"
          >
            {t('flashSales.form.cancel')}
          </Button>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitting || hasWarnings}
            icon={isEditing ? <FiSave /> : <FiCheck />}
            className="flex-1 sm:flex-none"
          >
            {submitting
              ? t('flashSales.form.saving')
              : isEditing
                ? t('flashSales.form.update')
                : t('flashSales.form.create')}
          </PrimaryButton>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-stretch">
          {/* ── Form Card ── */}
          <div className="h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
            <h2 className="font-semibold text-lg text-ink">{t('flashSales.form.eventInfoTitle')}</h2>

            <FormInput
              label={t('flashSales.form.nameLabel')}
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('flashSales.form.namePlaceholder')}
            />
            <FormTextarea
              label={t('flashSales.form.descriptionLabel')}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              inputClassName="h-24"
              placeholder={t('flashSales.form.descriptionPlaceholder')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label={t('flashSales.form.startLabel')}
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
              <FormInput
                label={t('flashSales.form.endLabel')}
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          <aside className="space-y-4 xl:self-start">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
              <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <FiClock className="text-muted" />
                {t('flashSales.form.summaryTitle')}
              </h3>
              <div className="space-y-2.5 text-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('flashSales.form.scheduleStatus')}</span>
                  <span className="font-semibold text-body">{scheduleStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('flashSales.form.participatingVariants')}</span>
                  <span className="font-semibold text-body">{form.items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('flashSales.form.totalStock')}</span>
                  <span className="font-semibold text-body">{totalStock.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">{t('flashSales.form.originalValue')}</span>
                    <span className="font-medium text-body">{formatPrice(totalOriginalValue)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted">{t('flashSales.form.flashValue')}</span>
                    <span className="font-medium text-body">{formatPrice(totalFlashValue)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted flex items-center gap-1">
                      <FiTrendingDown className="text-emerald-500" />
                      {t('flashSales.form.estimatedSavings')}
                    </span>
                    <span className="font-semibold text-emerald-600">{formatPrice(totalDiscountValue)} ({discountRate}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
              <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <FiAlertTriangle className={hasWarnings ? 'text-amber-500' : 'text-emerald-500'} />
                {t('flashSales.form.validationTitle')}
              </h3>
              {hasWarnings ? (
                <ul className="space-y-2 text-md text-muted">
                  {invalidTimeRange && (
                    <li>{t('flashSales.form.validationTime')}</li>
                  )}
                  {invalidPriceCount > 0 && (
                    <li>{t('flashSales.form.validationPrice', { count: invalidPriceCount })}</li>
                  )}
                  {invalidStockCount > 0 && (
                    <li>{t('flashSales.form.validationStock', { count: invalidStockCount })}</li>
                  )}
                </ul>
              ) : (
                <p className="text-md text-emerald-600">{t('flashSales.form.validationValid')}</p>
              )}
              {(startDate || endDate) && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm text-muted space-y-1">
                  {startDate && <p>{t('flashSales.form.startAt', { date: formatDateTime(startDate) })}</p>}
                  {endDate && <p>{t('flashSales.form.endAt', { date: formatDateTime(endDate) })}</p>}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ── Products Section ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="font-semibold text-lg text-ink">
              {t('flashSales.form.itemsTitle')}
              {form.items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted">
                  ({t('flashSales.form.itemCount', { count: form.items.length })})
                </span>
              )}
            </h2>
            <PrimaryButton type="button" onClick={handleOpenPicker} icon={<FiPlus />} className="w-full sm:w-auto">
              {t('flashSales.form.addProducts')}
            </PrimaryButton>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <AdminTableScroll>
              <AdminTable className="min-w-[760px] bg-white text-md dark:bg-slate-900">
                <thead>
                  <AdminTableHeadRow>
                    <AdminTableHeadCell>
                      <SortableHeaderLabel
                        label={t('flashSales.form.table.product')}
                        active={sortBy === 'productName'}
                        direction={sortDir}
                        onClick={() => toggleSort('productName')}
                      />
                    </AdminTableHeadCell>
                    <AdminTableHeadCell className="w-52">
                      <SortableHeaderLabel
                        label={t('flashSales.form.table.originalPrice')}
                        active={sortBy === 'originalPrice'}
                        direction={sortDir}
                        onClick={() => toggleSort('originalPrice')}
                      />
                    </AdminTableHeadCell>
                    <AdminTableHeadCell className="w-52">
                      <SortableHeaderLabel
                        label={t('flashSales.form.table.flashPrice')}
                        active={sortBy === 'flashPrice'}
                        direction={sortDir}
                        onClick={() => toggleSort('flashPrice')}
                      />
                    </AdminTableHeadCell>
                    <AdminTableHeadCell className="w-70">
                      <SortableHeaderLabel
                        label={t('flashSales.form.table.flashStock')}
                        active={sortBy === 'flashStock'}
                        direction={sortDir}
                        onClick={() => toggleSort('flashStock')}
                      />
                    </AdminTableHeadCell>
                    <AdminTableHeadCell className="w-16 text-center">{t('flashSales.form.table.remove')}</AdminTableHeadCell>
                  </AdminTableHeadRow>
                </thead>
                <tbody>
                  {form.items.length === 0 ? (
                    <AdminTableEmptyRow className="p-10" colSpan={5}>
                      <div className="text-subtle">
                        <FiPlus className="mx-auto mb-2 text-subtle" size={32} />
                        <p>{t('flashSales.form.empty')}</p>
                        <button
                          onClick={handleOpenPicker}
                          className="mt-2 text-sm text-blue-500 hover:underline font-medium"
                        >
                          {t('flashSales.form.addNow')}
                        </button>
                      </div>
                    </AdminTableEmptyRow>
                  ) : (
                    visibleItems.map((item) => {
                      const itemKey = getFlashSaleItemKey(item);
                      return (
                        <FlashSaleItemRow
                          key={itemKey}
                          item={item}
                          itemKey={itemKey}
                          variantFallback={tableLabels.variantFallback}
                          historyEmptyLabel={tableLabels.historyEmpty}
                          historyLabel={tableLabels.historyLabel}
                          stockLabel={tableLabels.stockLabel}
                          priceWarningTitle={tableLabels.priceWarningTitle}
                          stockWarningTitle={tableLabels.stockWarningTitle}
                          onChangeFlashPrice={handleChangeFlashPrice}
                          onChangeFlashStock={handleChangeFlashStock}
                          onRemove={handleRemoveItem}
                        />
                      );
                    })
                  )}
                </tbody>
              </AdminTable>
            </AdminTableScroll>
          </div>
          {form.items.length > ITEMS_PER_PAGE && (
            <Pagination
              variant="admin"
              currentPage={itemsPage}
              totalPages={itemsTotalPages}
              onPageChange={setItemsPage}
              totalItems={form.items.length}
              perPage={ITEMS_PER_PAGE}
              label={t('flashSales.form.pagination')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
