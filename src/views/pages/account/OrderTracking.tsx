import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiXCircle, FiTruck, FiTrash2, FiUploadCloud, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatDateFull as formatDate } from '@/utils/format';
import orderService from '@/apis/services/orderService';
import returnService from '@/apis/services/returnService';
import type { OrderResponse, ReturnRequestResponse } from '@/types';

import { getOrderTrackingSteps, ORDER_STATUS_INDEX } from '@/constants/orderConstants';
import { BackButton, Button, Checkbox, PrimaryButton, QuantitySelector, OrderStatusTimeline, OrderAddressCard, OrderItemsTable, OrderSummaryCard } from '@/components';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';

const MAX_RETURN_EVIDENCE_IMAGES = 5;

interface ReturnEvidenceFile {
  file: File;
  previewUrl: string;
}
export default function OrderTracking() {
  const { t, i18n } = useTranslation(['account', 'common']);
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReturn, setActiveReturn] = useState<ReturnRequestResponse | null>(null);

  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [returnItemQuantities, setReturnItemQuantities] = useState<Record<string, number>>({});
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, boolean>>({});
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnEvidenceFiles, setReturnEvidenceFiles] = useState<ReturnEvidenceFile[]>([]);
  const returnEvidenceFilesRef = useRef<ReturnEvidenceFile[]>([]);
  const returnEvidenceInputRef = useRef<HTMLInputElement>(null);

  const QUICK_REASONS = [
    t('orderTracking.returnForm.quickReasons.defective'),
    t('orderTracking.returnForm.quickReasons.wrongItem'),
    t('orderTracking.returnForm.quickReasons.notAsDescribed'),
    t('orderTracking.returnForm.quickReasons.noNeed'),
    t('orderTracking.returnForm.quickReasons.missingParts'),
  ];

  const fetchReturnStatus = async (orderNumber: string) => {
    try {
      const res = await returnService.getMine({ keyword: orderNumber, size: 5 });
      const found = res.data?.data?.find(r => r.orderNumber === orderNumber);
      if (found) setActiveReturn(found);
    } catch {
      // Ignore errors
    }
  };

  useEffect(() => {
    returnEvidenceFilesRef.current = returnEvidenceFiles;
  }, [returnEvidenceFiles]);

  useEffect(() => () => {
    returnEvidenceFilesRef.current.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
    });
  }, []);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    orderService.getByNumber(orderNumber).then(res => {
      setOrder(res.data);
      if (res.data.orderStatus === 'SHIPPED') {
        fetchReturnStatus(res.data.orderNumber);
      }
    }).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [orderNumber]);

  const clearReturnEvidenceFiles = () => {
    setReturnEvidenceFiles((prev) => {
      prev.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });
      return [];
    });
  };

  const resetReturnForm = () => {
    setIsReturning(false);
    setReturnReason('');
    setReturnNote('');
    clearReturnEvidenceFiles();
  };

  const handleStartReturn = () => {
    if (!order) return;
    clearReturnEvidenceFiles();
    const initialQuants: Record<string, number> = {};
    const initialSelected: Record<string, boolean> = {};
    order.items.forEach(item => {
      initialQuants[item.id] = item.quantity;
      initialSelected[item.id] = false;
    });
    setReturnItemQuantities(initialQuants);
    setSelectedReturnItems(initialSelected);
    setIsReturning(true);
    setReturnReason('');
    setReturnNote('');
  };

  const handleQuantityChange = (itemId: string, val: number) => {
    setReturnItemQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const handleEvidenceFilesSelected = (files: FileList | File[] | null | undefined) => {
    if (!files) return;

    const incomingFiles = Array.from(files);
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length !== incomingFiles.length) {
      toast.error(t('orderTracking.toasts.invalidEvidenceImageType'));
    }

    if (imageFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_RETURN_EVIDENCE_IMAGES - returnEvidenceFilesRef.current.length;
    if (remainingSlots <= 0) {
      toast.error(t('orderTracking.toasts.evidenceImageLimitExceeded', {
        max: MAX_RETURN_EVIDENCE_IMAGES,
      }));
      return;
    }

    if (imageFiles.length > remainingSlots) {
      toast.error(t('orderTracking.toasts.evidenceImageLimitExceeded', {
        max: MAX_RETURN_EVIDENCE_IMAGES,
      }));
    }

    const nextEvidenceFiles = imageFiles
      .slice(0, remainingSlots)
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setReturnEvidenceFiles((prev) => [...prev, ...nextEvidenceFiles]);
  };

  const handleRemoveEvidenceFile = (index: number) => {
    setReturnEvidenceFiles((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmitReturn = async () => {
    if (!order) return;
    if (!returnReason.trim()) {
      toast.error(t('orderTracking.toasts.reasonRequired'));
      return;
    }

    const itemsPayload: Array<{ sku: string; quantity: number }> = [];

    for (const item of order.items) {
      if (!selectedReturnItems[item.id]) {
        continue;
      }

      const quantity = returnItemQuantities[item.id] || 0;
      if (quantity <= 0) {
        continue;
      }

      const sku = item.sku?.trim();
      if (!sku) {
        toast.error(t('orderTracking.toasts.createFailed'));
        return;
      }

      itemsPayload.push({ sku, quantity });
    }

    if (itemsPayload.length === 0) {
      toast.error(t('orderTracking.toasts.selectItemsRequired'));
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const idempotencyKey = typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : `ret-${Date.now()}`;
      await returnService.create({
        orderNumber: order.orderNumber,
        reason: returnReason.trim(),
        evidenceNote: returnNote.trim() || undefined,
        items: itemsPayload,
      }, returnEvidenceFiles.map(({ file }) => file), idempotencyKey);

      toast.success(t('orderTracking.toasts.createSuccess'));
      resetReturnForm();
      fetchReturnStatus(order.orderNumber);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t, 'account:orderTracking.toasts.createFailed'));
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 animate-pulse">
        <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />)}</div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="text-center py-12">
      <FiXCircle className="text-6xl text-subtle mx-auto mb-4" />
      <h2 className="text-lg font-bold mb-2">{t('orderTracking.notFound.title')}</h2>
      <Link to="/user/orders" className="text-blue-600 hover:underline">← {t('orderTracking.notFound.back')}</Link>
    </div>
  );

  const currentStep = ORDER_STATUS_INDEX[order.orderStatus] ?? -1;
  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED';
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  const allowReturnBtn = order.orderStatus === 'SHIPPED' && order.paymentStatus === 'COMPLETED' && !activeReturn && !isReturning;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/user/orders" />
          <h1 className="text-lg sm:text-2xl font-bold">{t('orderTracking.title', { orderNumber: order.orderNumber })}</h1>
        </div>
        {allowReturnBtn && (
          <Button onClick={handleStartReturn} variant="outline" className="text-blue-600 border-blue-600 whitespace-nowrap">
            {t('orderTracking.actions.requestReturn')}
          </Button>
        )}
      </div>

      {/* Return Active Banner */}
      {activeReturn && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 sm:p-6 shadow-sm border border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
              <FiPackage className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-blue-800 dark:text-blue-200">{t('orderTracking.returnBanner.title')}</h3>
              <p className="text-lg text-blue-600 dark:text-blue-300 mt-0.5">{t('orderTracking.returnBanner.description')}</p>
            </div>
          </div>
          <Link to={`/user/returns`} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-lg font-semibold text-blue-600 shadow-sm border border-blue-100 dark:border-slate-700 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700">
            {t('orderTracking.returnBanner.button')}
          </Link>
        </div>
      )}

      {/* Inline Return Form */}
      {isReturning && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-blue-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-blue-600">{t('orderTracking.returnForm.title')}</h2>
            <Button variant="secondary" className="text-muted" onClick={resetReturnForm}>{t('orderTracking.returnForm.cancel')}</Button>
          </div>

          <div className="space-y-4">
            <div className="font-semibold flex items-center gap-2"><FiPackage className="text-blue-600" /> {t('orderTracking.returnForm.selectItems')}</div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {order.items.map(line => (
                <div key={line.id} className={`p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors ${selectedReturnItems[line.id] ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Checkbox
                      checked={!!selectedReturnItems[line.id]}
                      onCheckedChange={(checked) => setSelectedReturnItems(prev => ({ ...prev, [line.id]: checked }))}
                      className="w-5 h-5"
                      aria-label={line.productName}
                    />
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      {line.imageUrl ? <img src={line.imageUrl} alt={line.productName} className="w-full h-full object-cover" /> : <FiPackage className="text-subtle text-lg" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold line-clamp-1">{line.productName}</p>
                    <p className="text-lg text-muted mt-1">
                      {line.variantName} | {t('orderTracking.returnForm.purchased')}: {line.quantity} | {formatPrice(Number(line.unitPrice || 0))}
                    </p>
                  </div>
                  <div className={`flex items-center gap-3 transition-opacity ${selectedReturnItems[line.id] ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <span className="text-lg font-medium text-muted">{t('orderTracking.returnForm.quantity')}:</span>
                    <QuantitySelector
                      value={returnItemQuantities[line.id] ?? line.quantity}
                      onChange={(val) => handleQuantityChange(line.id, val)}
                      min={1}
                      max={line.quantity}
                      size="sm"
                      disabled={!selectedReturnItems[line.id]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">{t('orderTracking.returnForm.reasonLabel')} <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_REASONS.map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReturnReason(reason)}
                  className={`px-3 py-1.5 rounded-full text-lg font-medium transition-colors ${returnReason === reason ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50' : 'bg-slate-100 text-muted hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-transparent'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder={t('orderTracking.returnForm.reasonPlaceholder')}
              className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-lg outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">{t('orderTracking.returnForm.noteLabel')}</label>
            <textarea
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder={t('orderTracking.returnForm.notePlaceholder')}
              className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-lg outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="block text-lg font-semibold">{t('orderTracking.returnForm.imagesLabel')}</label>
              <span className="text-lg text-muted">
                {t('orderTracking.returnForm.imagesCount', {
                  count: returnEvidenceFiles.length,
                  max: MAX_RETURN_EVIDENCE_IMAGES,
                })}
              </span>
            </div>

            <input
              ref={returnEvidenceInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              multiple
              className="hidden"
              onChange={(event) => {
                handleEvidenceFilesSelected(event.target.files);
                event.target.value = '';
              }}
            />

            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-body">{t('orderTracking.returnForm.imagesHelper')}</p>
                  <p className="text-lg text-muted">
                    {t('orderTracking.returnForm.imagesHint', { max: MAX_RETURN_EVIDENCE_IMAGES })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<FiUploadCloud />}
                  className="border-slate-300 text-body dark:border-slate-600"
                  onClick={() => returnEvidenceInputRef.current?.click()}
                >
                  {t('orderTracking.returnForm.chooseImages')}
                </Button>
              </div>

              {returnEvidenceFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {returnEvidenceFiles.map((evidence, index) => (
                    <div
                      key={`${evidence.file.name}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 aspect-square"
                    >
                      <img
                        src={evidence.previewUrl}
                        alt={t('orderTracking.returnForm.imageAlt', { index: index + 1 })}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidenceFile(index)}
                        className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/90 text-white shadow-sm transition hover:bg-red-600"
                        aria-label={t('orderTracking.returnForm.removeImageAria', { index: index + 1 })}
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <PrimaryButton onClick={handleSubmitReturn} isLoading={isSubmittingReturn} className="w-full sm:w-auto min-w-[200px]">
              {t('orderTracking.returnForm.submit')}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Order Layout (2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Header */}
          {!isCancelled && order.trackingCode && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">{t('orderTracking.shipping.title')}</h2>
                  <p className="text-muted mt-1">{t('orderTracking.shipping.trackingCode')}: <span className="font-semibold text-body">{order.trackingCode}</span></p>
                </div>
                <FiTruck className="text-3xl text-blue-600 opacity-20" />
              </div>
            </div>
          )}

          {/* Vertical Timeline */}
          {!isCancelled && order.statusHistories && order.statusHistories.length > 0 && (
            <OrderStatusTimeline
              histories={order.statusHistories}
              locale={locale}
              dateOptions={{ day: '2-digit', month: '2-digit', year: 'numeric' }}
              deliveredTitle={t('orderTracking.timeline.deliveredTitle')}
              deliveredDescription={t('orderTracking.timeline.deliveredDescription')}
              className="p-6"
              deliveredDescriptionClassName="text-lg cursor-pointer hover:underline"
            />
          )}

          {/* Fallback progress bar for legacy orders without histories */}
          {!isCancelled && (!order.statusHistories || order.statusHistories.length === 0) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                {getOrderTrackingSteps(t).map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx <= currentStep;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && <div className={`absolute top-5 right-1/2 w-full h-0.5 ${idx <= currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-subtle'}`}>
                        <Icon />
                      </div>
                      <span className={`text-lg mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-subtle'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800 text-red-600">
              <div className="flex items-center gap-3"><FiXCircle className="text-2xl" /><span className="font-bold text-lg">{order.orderStatus === 'CANCELLED' ? t('orderTracking.cancelled.cancelled') : t('orderTracking.cancelled.returned')}</span></div>
            </div>
          )}

          <OrderItemsTable
            title={t('orderTracking.items.title')}
            items={order.items.map((item) => ({
              id: item.id,
              productName: item.productName,
              variantName: item.variantName,
              imageUrl: item.imageUrl,
              unitPrice: Number(item.unitPrice || 0),
              quantity: item.quantity,
              subtotal: item.subtotal,
            }))}
            labels={{
              product: t('orderTracking.items.title'),
              variant: t('orderTracking.items.variant'),
              unitPrice: t('orderTracking.items.unitPrice'),
              quantity: t('orderTracking.items.quantity'),
              lineTotal: t('orderTracking.items.lineTotal'),
            }}
          />
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <OrderSummaryCard
            title={t('orderTracking.summary.title')}
            className="p-6"
            contentClassName="text-lg"
            metaRows={[
              {
                label: t('orderTracking.summary.placedAt'),
                value: formatDate(order.createdAt),
              },
              {
                label: t('orderTracking.summary.updatedAt'),
                value: formatDate(order.updatedAt || order.createdAt),
              },
              {
                label: t('orderTracking.summary.payment'),
                value: order.paymentMethod,
              },
            ]}
            amountRows={[
              {
                label: t('orderTracking.summary.subtotal'),
                value: formatPrice(order.subtotal),
              },
              {
                label: t('orderTracking.summary.shippingFee'),
                value: formatPrice(order.shippingFee),
              },
              ...(order.discountAmount > 0
                ? [
                  {
                    label: t('orderTracking.summary.productDiscount'),
                    value: `-${formatPrice(order.discountAmount)}`,
                    valueClassName: 'text-green-600',
                  },
                ]
                : []),
              ...((order.shippingDiscountAmount || 0) > 0
                ? [
                  {
                    label: t('orderTracking.summary.shippingDiscount'),
                    value: `-${formatPrice(order.shippingDiscountAmount!)}`,
                    valueClassName: 'text-green-600',
                  },
                ]
                : []),
              ...((order.taxAmount || 0) > 0
                ? [
                  {
                    label: t('orderTracking.summary.vat', {
                      percent: order.taxPercent ?? 0,
                      suffix: order.taxMode === 'INCLUDED' ? t('orderTracking.summary.vatIncluded') : '',
                    }),
                    value: `${order.taxMode === 'EXCLUDED' ? '+' : ''}${formatPrice(order.taxAmount!)}`,
                    valueClassName: order.taxMode === 'EXCLUDED' ? 'text-ink' : 'text-muted',
                  },
                ]
                : []),
            ]}
            totalRow={{
              label: t('orderTracking.summary.total'),
              value: formatPrice(order.totalAmount),
            }}
          />

          <OrderAddressCard
            title={t('orderTracking.address.title')}
            address={order.shippingAddress}
            className="p-6"
            icon={<FiMapPin className="text-orange-600" />}
          />

          {order.note && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-3">{t('orderTracking.note.title')}</h2>
              <p className="text-lg text-muted">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
