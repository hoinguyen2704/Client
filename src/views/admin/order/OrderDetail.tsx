import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiUser, FiMapPin, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatDateTime as formatDate } from '@/utils/format';
import { Button, StatusBadge, CustomSelect, BackButton, OrderStatusTimeline, OrderAddressCard, OrderInfoCard, OrderItemsTable, OrderSummaryCard } from '@/components';
import { toast } from 'sonner';
import adminOrderService from '@/apis/services/adminOrderService';
import { getAdminOrderStatusOptions } from '@/constants/orderConstants';

import type { OrderResponse } from '@/types';
import useShopStore from '@/stores/useShopStore';
import { downloadBlob } from '@/utils/download';

export default function OrderDetail() {
  const { t } = useTranslation('adminSales');
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const { shop, fetchShopInfo } = useShopStore();

  const fetchOrderDetail = useCallback(
    async (orderNumber: string, options?: { keepEditStatus?: boolean }) => {
      const res = await adminOrderService.getByNumber(orderNumber);
      const found = res.data;
      if (found) {
        setOrder(found);
        if (!options?.keepEditStatus) {
          setEditStatus(found.orderStatus);
        }
      }
      return found;
    },
    [],
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchOrderDetail(id)
      .catch(err => console.error('Failed:', err))
      .finally(() => setLoading(false));
  }, [id, fetchOrderDetail]);

  useEffect(() => { fetchShopInfo(); }, [fetchShopInfo]);

  const orderStatusOptions = useMemo(
    () => (order ? getAdminOrderStatusOptions(order.orderStatus, t) : []),
    [order, t],
  );

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order || isUpdatingStatus || !newStatus || newStatus === order.orderStatus) return;
    const previousStatus = order.orderStatus;
    setEditStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      const res = await adminOrderService.updateStatus(order.id, newStatus);
      setOrder(res.data);
      setEditStatus(res.data.orderStatus);
      try {
        await fetchOrderDetail(order.orderNumber);
      } catch (refreshErr) {
        console.warn('Refetch order detail after status update failed:', refreshErr);
      }
      toast.success(t('orderDetail.toasts.statusUpdated'));
    } catch (err) {
      console.error(err);
      setEditStatus(previousStatus);
      toast.error(t('orderDetail.toasts.statusFailed'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportInvoice = async () => {
    if (!order) return;
    try {
      const blob = await adminOrderService.exportInvoice(order.id);
      downloadBlob(blob, `invoice_${order.orderNumber}.pdf`);
      toast.success(t('orderDetail.toasts.invoiceSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('orderDetail.toasts.invoiceFailed'));
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 animate-pulse space-y-3">
          <div className="h-5 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center text-subtle">{t('orderDetail.notFound')}</div>;
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton to="/admin/orders" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2 sm:gap-3">
                {t('orderDetail.title', { orderNumber: order.orderNumber })}
                <StatusBadge status={order.orderStatus} />
              </h1>
              <p className="text-muted text-md mt-1">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="w-full sm:w-56">
              <label className="block text-sm font-semibold text-muted mb-1.5">{t('orderDetail.statusLabel')}</label>
              <CustomSelect
                value={editStatus || order.orderStatus}
                onChange={handleUpdateStatus}
                options={orderStatusOptions}
                className="w-full"
                disabled={isUpdatingStatus || orderStatusOptions.length <= 1}
              />
            </div>
            <Button onClick={handleExportInvoice} variant="success" size="md" icon={<FiDownload />} className="w-full sm:w-auto">
              {t('orderDetail.downloadInvoice')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Column (Timeline + Items) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Vertical Timeline */}
            {order.statusHistories && order.statusHistories.length > 0 && (
              <OrderStatusTimeline
                histories={order.statusHistories}
                deliveredTitle={t('orderDetail.timelineDelivered')}
                deliveredDescription={t('orderDetail.timelineDeliveredDescription')}
              />
            )}

            <OrderItemsTable
              title={(
                <span className="flex items-center gap-2">
                  <FiPackage className="text-blue-600" />
                  <span>{t('orderDetail.itemsTitle', { count: order.items?.length || 0 })}</span>
                </span>
              )}
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
                product: t('orderDetail.table.product'),
                variant: t('orderDetail.table.variant'),
                unitPrice: t('orderDetail.table.unitPrice'),
                quantity: t('orderDetail.table.quantity'),
                lineTotal: t('orderDetail.table.subtotal'),
              }}
            />

            {/* Note */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-4">{t('orderDetail.noteTitle')}</h2>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-md border border-yellow-100 dark:border-yellow-900/50">
                {order.note || t('orderDetail.noNote')}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Info */}
            <OrderInfoCard
              title={t('orderDetail.customerTitle')}
              icon={<FiUser className="text-blue-600" />}
              items={[...(order.customerName ? [
                {
                  label: `${t('orderDetail.fullName')}:`,
                  value: order.customerName,
                },] : []),
              ...(order.customerEmail ? [
                {
                  label: `${t('orderDetail.email')}:`,
                  value: order.customerEmail,
                  valueClassName: 'text-blue-600',
                },] : []),
              ...(order.customerPhone ? [
                {
                  label: `${t('orderDetail.phone')}:`,
                  value: order.customerPhone,
                },] : []),]} />

            {/* Shipping */}
            <OrderAddressCard
              title={t('orderDetail.shippingTitle')}
              address={order.shippingAddress}
              fallbackText={t('orderDetail.shippingAddressFallback')}
              icon={<FiMapPin className="text-orange-600" />}
            />

            {/* Order Info / Total */}
            <OrderSummaryCard
              title={t('orderDetail.orderInfoTitle')}
              metaRows={[
                {
                  label: t('orderDetail.placedAt'),
                  value: formatDate(order.createdAt),
                },
                {
                  label: t('orderDetail.updatedAt'),
                  value: formatDate(order.updatedAt || order.createdAt),
                },
                {
                  label: t('orderDetail.paymentTitle'),
                  value: order.paymentMethod,
                },
                {
                  label: t('orderDetail.paymentStatus'),
                  value: <StatusBadge status={order.paymentStatus} />,
                  valueClassName: 'font-normal',
                },
                ...(order.couponCode
                  ? [
                    {
                      label: t('orderDetail.couponCode'),
                      value: order.couponCode,
                      valueClassName: 'font-mono font-bold text-blue-600',
                    },
                  ]
                  : []),
                ...(order.shippingCouponCode
                  ? [
                    {
                      label: t('orderDetail.shippingCouponCode'),
                      value: order.shippingCouponCode,
                      valueClassName: 'font-mono font-bold text-blue-600',
                    },
                  ]
                  : []),
              ]}
              amountRows={[
                {
                  label: t('orderDetail.summary.subtotal'),
                  value: formatPrice(order.subtotal),
                },
                {
                  label: t('orderDetail.summary.shippingFee'),
                  value: formatPrice(order.shippingFee),
                },
                ...((order.discountAmount || 0) > 0
                  ? [
                    {
                      label: t('orderDetail.summary.productDiscount'),
                      value: `-${formatPrice(order.discountAmount)}`,
                      valueClassName: 'text-red-500',
                    },
                  ]
                  : []),
                ...((order.shippingDiscountAmount || 0) > 0
                  ? [
                    {
                      label: t('orderDetail.summary.shippingDiscount'),
                      value: `-${formatPrice(order.shippingDiscountAmount!)}`,
                      valueClassName: 'text-red-500',
                    },
                  ]
                  : []),
                ...((order.taxAmount || 0) > 0
                  ? [
                    {
                      label: t('orderDetail.summary.vat', {
                        percent: order.taxPercent ?? 0,
                        suffix: order.taxMode === 'INCLUDED' ? t('orderDetail.summary.vatIncluded') : '',
                      }),
                      value: `${order.taxMode === 'EXCLUDED' ? '+' : ''}${formatPrice(order.taxAmount!)}`,
                      valueClassName: order.taxMode === 'EXCLUDED' ? 'text-ink' : 'text-muted',
                    },
                  ]
                  : []),
              ]}
              totalRow={{
                label: t('orderDetail.summary.total'),
                value: formatPrice(order.totalAmount),
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== PRINT INVOICE TEMPLATE ===== */}
      <div className="hidden print:block w-full text-black bg-white p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold font-serif mb-2 text-[#2539e6]">{shop.shopName}</h2>
            <p className="text-md">{shop.address}</p>
            <p className="text-md">{t('orderDetail.phone')}: {shop.hotline}</p>
            <p className="text-md">Email: {shop.shopEmail}</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#2539e6]">{t('orderDetail.invoice.title')}</h1>
            <p className="font-bold text-lg mt-2 font-mono">#{order.orderNumber}</p>
            <p className="text-md text-muted">{t('orderDetail.invoice.date')}: {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="mb-8 border-t border-slate-200 pt-6 flex justify-between">
          <div>
            <h3 className="font-bold text-muted uppercase text-sm mb-2">{t('orderDetail.invoice.customer')}</h3>
            <p className="font-bold text-base">{order.customerName}</p>
            <p className="text-md">{order.shippingAddress || t('orderDetail.invoice.pickupFallback')}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-muted uppercase text-sm mb-2">{t('orderDetail.invoice.paymentShipping')}</h3>
            <p className="text-md"><strong>{t('orderDetail.paymentMethod')}:</strong> {order.paymentMethod}</p>
            <p className="text-md"><strong>{t('orderDetail.paymentStatus')}:</strong> {order.paymentStatus === 'PAID' ? t('orderDetail.invoice.paid') : t('orderDetail.invoice.unpaid')}</p>
          </div>
        </div>

        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 text-md">
              <th className="py-2 font-bold">{t('orderDetail.table.product')}</th>
              <th className="py-2 font-bold text-center">{t('orderDetail.table.quantity')}</th>
              <th className="py-2 font-bold text-right">{t('orderDetail.table.unitPrice')}</th>
              <th className="py-2 font-bold text-right">{t('orderDetail.table.subtotal')}</th>
            </tr>
          </thead>
          <tbody className="text-md">
            {order.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-3 pr-4">
                  <div className="font-medium text-base">{item.productName}</div>
                  {item.variantName && (
                    <div className="text-sm mt-1 italic">{t('orderDetail.invoice.variantPrefix', { name: item.variantName })}</div>
                  )}
                </td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">{formatPrice(item.unitPrice)}</td>
                <td className="py-3 text-right font-medium">{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-2 text-md">
            <div className="flex justify-between"><span>{t('orderDetail.summary.subtotal')}:</span> <span>{formatPrice(order.subtotal + order.shippingFee)}</span></div>
            {(order.discountAmount || 0) > 0 && <div className="flex justify-between"><span>{t('orderDetail.summary.productDiscount')}:</span> <span>-{formatPrice(order.discountAmount!)}</span></div>}
            {(order.shippingDiscountAmount || 0) > 0 && <div className="flex justify-between"><span>{t('orderDetail.summary.shippingDiscount')}:</span> <span>-{formatPrice(order.shippingDiscountAmount!)}</span></div>}
            {(order.taxAmount || 0) > 0 && (
              <div className="flex justify-between">
                <span>{t('orderDetail.summary.vat', {
                  percent: order.taxPercent ?? 0,
                  suffix: order.taxMode === 'INCLUDED' ? t('orderDetail.summary.vatIncluded') : '',
                })}:</span>
                <span>{order.taxMode === 'EXCLUDED' ? '+' : ''}{formatPrice(order.taxAmount!)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-slate-800 mt-2">
              <span>{t('orderDetail.summary.total')}:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-center mx-12 mt-16 text-md">
          <div>
            <p className="font-bold mb-24">{t('orderDetail.invoice.buyer')}</p>
            <p className="text-muted italic">{t('orderDetail.invoice.signatureHint')}</p>
          </div>
          <div>
            <p className="font-bold mb-24">{t('orderDetail.invoice.seller')}</p>
            <p className="text-muted italic">{t('orderDetail.invoice.signatureHint')}</p>
          </div>
        </div>

        <div className="mt-20 text-center text-sm text-muted border-t border-slate-200 pt-4">
          {t('orderDetail.invoice.thanks', { shopName: shop.shopName })}
        </div>
      </div>
    </>
  );
}
