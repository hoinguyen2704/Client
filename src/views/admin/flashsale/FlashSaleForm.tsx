import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiZap, FiArrowLeft, FiPlus, FiCheck, FiSave, FiClock, FiTrendingDown, FiAlertTriangle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { adminFlashSaleService } from '@/apis';
import type { FlashSaleResponse, FlashSaleItemForm } from '@/types';
import { PrimaryButton, Button, TrashButton, FormInput, FormTextarea, Pagination } from '@/components';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import type { SelectedVariant } from '@/components';
import { formatDateTime, formatPrice } from '@/utils/format';
import { resolveVariantSalesMetrics } from '@/utils/variantSales';
import { PICKER_RESULT_KEY } from './ProductPicker';

const ITEMS_PER_PAGE = PAGE_SIZE.LARGE;

export default function FlashSaleForm() {
  const { t } = useTranslation(['adminCatalog', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

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
              flashStock: i.flashStock,
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
        navigate('/admin/flash-sales');
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
    navigate(location.pathname, { replace: true, state: {} });
  }, [id, isEditLoaded, location.pathname, location.state, navigate]);

  const handleOpenPicker = () => {
    navigate('/admin/flash-sales/pick-products', {
      state: {
        initialSelectedIds: form.items.map(i => i.variantId),
        returnTo: isEditing ? `/admin/flash-sales/${id}/edit` : '/admin/flash-sales/new',
      },
    });
  };

  const handleRemoveItem = (index: number) => {
    setForm(prev => {
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  const handleChangeItem = (index: number, field: 'flashPrice' | 'flashStock', value: number) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

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
        toast.success(t('flashSales.toasts.updateSuccess'));
      } else {
        await adminFlashSaleService.create(payload);
        toast.success(t('flashSales.toasts.createSuccess'));
      }
      navigate('/admin/flash-sales');
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, translate, 'adminCatalog:flashSales.toasts.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const startDate = form.startTime ? new Date(form.startTime) : null;
  const endDate = form.endTime ? new Date(form.endTime) : null;
  const now = new Date();

  const scheduleStatus = (() => {
    if (!startDate || !endDate) return t('flashSales.form.schedule.incomplete');
    if (endDate <= startDate) return t('flashSales.form.schedule.invalid');
    if (now < startDate) return t('flashSales.form.schedule.scheduled');
    if (now >= startDate && now <= endDate) return t('flashSales.form.schedule.active');
    return t('flashSales.form.schedule.ended');
  })();

  const totalStock = form.items.reduce((sum, item) => sum + Math.max(0, Number(item.flashStock) || 0), 0);
  const totalOriginalValue = form.items.reduce(
    (sum, item) => sum + (Number(item.originalPrice) || 0) * Math.max(0, Number(item.flashStock) || 0),
    0,
  );
  const totalFlashValue = form.items.reduce(
    (sum, item) => sum + (Number(item.flashPrice) || 0) * Math.max(0, Number(item.flashStock) || 0),
    0,
  );
  const totalDiscountValue = Math.max(0, totalOriginalValue - totalFlashValue);
  const discountRate = totalOriginalValue > 0 ? Math.round((totalDiscountValue / totalOriginalValue) * 100) : 0;

  const invalidTimeRange = !!(startDate && endDate && endDate <= startDate);
  const invalidPriceCount = form.items.filter(
    (item) => Number(item.flashPrice) <= 0 || Number(item.flashPrice) >= Number(item.originalPrice),
  ).length;
  const invalidStockCount = form.items.filter((item) => Number(item.flashStock) <= 0).length;
  const hasWarnings = invalidTimeRange || invalidPriceCount > 0 || invalidStockCount > 0;

  const itemsTotalPages = Math.max(1, Math.ceil(form.items.length / ITEMS_PER_PAGE));
  const startIndex = (itemsPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = form.items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (itemsPage > itemsTotalPages) {
      setItemsPage(itemsTotalPages);
    }
  }, [itemsPage, itemsTotalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400">
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
            onClick={() => navigate('/admin/flash-sales')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
              <FiZap className="text-yellow-500" />
              {isEditing ? t('flashSales.form.editTitle') : t('flashSales.form.createTitle')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditing
                ? t('flashSales.form.editDescription')
                : t('flashSales.form.createDescription')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/admin/flash-sales')}
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-none"
          >
            {t('flashSales.form.cancel')}
          </Button>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitting}
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
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="space-y-6">
          {/* ── Form Card ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
            <h2 className="font-semibold text-lg text-strong">{t('flashSales.form.eventInfoTitle')}</h2>

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

          {/* ── Products Section ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="font-semibold text-lg text-strong">
                {t('flashSales.form.itemsTitle')}
                {form.items.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({t('flashSales.form.itemCount', { count: form.items.length })})
                  </span>
                )}
              </h2>
              <PrimaryButton type="button" onClick={handleOpenPicker} icon={<FiPlus />} className="w-full sm:w-auto">
                {t('flashSales.form.addProducts')}
              </PrimaryButton>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left bg-white dark:bg-slate-900 text-md">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 font-medium text-muted">{t('flashSales.form.table.product')}</th>
                      <th className="p-3 font-medium text-muted w-32">{t('flashSales.form.table.originalPrice')}</th>
                      <th className="p-3 font-medium text-muted w-36">{t('flashSales.form.table.flashPrice')}</th>
                      <th className="p-3 font-medium text-muted w-40">{t('flashSales.form.table.flashStock')}</th>
                      <th className="p-3 font-medium text-muted w-16 text-center">{t('flashSales.form.table.remove')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {form.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center">
                          <div className="text-slate-400">
                            <FiPlus className="mx-auto mb-2 text-slate-300" size={32} />
                            <p>{t('flashSales.form.empty')}</p>
                            <button
                              onClick={handleOpenPicker}
                              className="mt-2 text-sm text-purple-500 hover:underline font-medium"
                            >
                              {t('flashSales.form.addNow')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleItems.map((item, idx) => {
                        const actualIndex = startIndex + idx;
                        const sales = resolveVariantSalesMetrics(item);
                        return (
                          <tr key={`${item.variantId}-${actualIndex}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl || '/placeholder.png'}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-700 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-medium text-strong-soft truncate" title={item.productName}>
                                    {item.productName}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {item.variantName || t('productPicker.variantFallback')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-slate-500">{formatPrice(item.originalPrice)}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                value={item.flashPrice}
                                onChange={(e) => handleChangeItem(actualIndex, 'flashPrice', Number(e.target.value))}
                              />
                            </td>
                            <td className="p-3">
                              <div className="space-y-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                  value={item.flashStock}
                                  onChange={(e) => handleChangeItem(actualIndex, 'flashStock', Number(e.target.value))}
                                />
                                <div className="text-sm text-slate-500 leading-tight">
                                  {item.grossSoldQty === undefined && item.stockQuantity === undefined ? (
                                    <div>{t('flashSales.form.historyEmpty')}</div>
                                  ) : (
                                    <>
                                      <div>
                                        {t('flashSales.form.historyLabel', {
                                          gross: sales.gross.toLocaleString(),
                                          returned: sales.returned.toLocaleString(),
                                          net: sales.net.toLocaleString(),
                                        })}
                                      </div>
                                      <div>
                                        {t('flashSales.form.stockLabel', {
                                          stock: (item.stockQuantity ?? 0).toLocaleString(),
                                        })}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <TrashButton onClick={() => handleRemoveItem(actualIndex)} />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
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

        <aside className="space-y-4 xl:sticky xl:top-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <h3 className="font-semibold text-strong mb-3 flex items-center gap-2">
              <FiClock className="text-slate-500" />
              {t('flashSales.form.summaryTitle')}
            </h3>
            <div className="space-y-2.5 text-md">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('flashSales.form.scheduleStatus')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{scheduleStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('flashSales.form.participatingVariants')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{form.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('flashSales.form.totalStock')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalStock.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('flashSales.form.originalValue')}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{formatPrice(totalOriginalValue)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-500">{t('flashSales.form.flashValue')}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{formatPrice(totalFlashValue)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <FiTrendingDown className="text-emerald-500" />
                    {t('flashSales.form.estimatedSavings')}
                  </span>
                  <span className="font-semibold text-emerald-600">{formatPrice(totalDiscountValue)} ({discountRate}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <h3 className="font-semibold text-strong mb-3 flex items-center gap-2">
              <FiAlertTriangle className={hasWarnings ? 'text-amber-500' : 'text-emerald-500'} />
              {t('flashSales.form.validationTitle')}
            </h3>
            {hasWarnings ? (
              <ul className="space-y-2 text-md text-body-soft">
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
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 space-y-1">
                {startDate && <p>{t('flashSales.form.startAt', { date: formatDateTime(startDate) })}</p>}
                {endDate && <p>{t('flashSales.form.endAt', { date: formatDateTime(endDate) })}</p>}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
