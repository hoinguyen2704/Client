import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiUser, FiMapPin, FiCreditCard, FiPackage, FiCheck } from 'react-icons/fi';
import { formatPrice, formatDateTime as formatDate } from '@/utils/format';
import { Button, StatusBadge, CustomSelect, BackButton } from '@/components';
import { toast } from 'sonner';
import adminOrderService from '@/apis/services/adminOrderService';
import { getAdminOrderStatusOptions } from '@/constants/orderConstants';

import type { OrderResponse } from '@/types';
import useShopStore from '@/stores/useShopStore';
import { downloadBlob } from '@/utils/download';

export default function OrderDetail() {
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
    () => (order ? getAdminOrderStatusOptions(order.orderStatus) : []),
    [order],
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
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    } catch (err) {
      console.error(err);
      setEditStatus(previousStatus);
      toast.error('Cập nhật trạng thái đơn hàng thất bại!');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportInvoice = async () => {
    if (!order) return;
    try {
      const blob = await adminOrderService.exportInvoice(order.id);
      downloadBlob(blob, `invoice_${order.orderNumber}.pdf`);
      toast.success('Xuất hóa đơn PDF thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Xuất hóa đơn thất bại!');
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
    return <div className="p-8 text-center text-slate-400">Không tìm thấy đơn hàng</div>;
  }

  return (
    <>
    <div className="space-y-4 sm:space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/admin/orders" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2 sm:gap-3">
              Đơn hàng {order.orderNumber}
              <StatusBadge status={order.orderStatus} />
            </h1>
            <p className="text-slate-500 text-md mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="w-full sm:w-56">
            <label className="block text-sm font-semibold text-slate-500 mb-1.5">Trạng thái đơn hàng</label>
            <CustomSelect
              value={editStatus || order.orderStatus}
              onChange={handleUpdateStatus}
              options={orderStatusOptions}
              className="w-full"
              disabled={isUpdatingStatus || orderStatusOptions.length <= 1}
            />
          </div>
          <Button onClick={handleExportInvoice} variant="success" size="md" icon={<FiDownload />} className="w-full sm:w-auto">
            Tải hóa đơn PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Column (Timeline + Items) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Vertical Timeline */}
          {order.statusHistories && order.statusHistories.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative">
                {order.statusHistories.map((history, idx) => {
                  const time = new Date(history.createdAt);
                  const isFirst = idx === 0;
                  const isLast = idx === order.statusHistories!.length - 1;

                  return (
                    <div key={history.id} className="flex gap-4">
                      {/* Left: Time */}
                      <div className="w-20 sm:w-24 flex-shrink-0 text-right pt-1">
                        <div className="text-md font-medium text-strong-soft">
                          {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Middle: Line & Dot */}
                      <div className="relative flex flex-col items-center">
                        {!isFirst && <div className="absolute top-0 -mt-6 w-px h-6 bg-slate-200 dark:bg-slate-700" />}
                        
                        <div className={`w-3 h-3 rounded-full z-10 mt-2 ${isFirst ? 'bg-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        
                        {!isLast && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-2" />}
                      </div>

                      {/* Right: Content */}
                      <div className="pb-8 pt-1 flex-1">
                        <h4 className={`text-base font-medium ${isFirst ? 'text-purple-600' : 'text-muted-strong'}`}>
                          {history.status === 'SHIPPED' ? 'Giao hàng thành công' : history.description}
                        </h4>
                        {isFirst && history.status === 'SHIPPED' && (
                          <div className="inline-flex items-center gap-1 text-md text-purple-600 mt-1">
                            <FiCheck /> Đơn hàng đã được giao thành công
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 sm:mb-6"><FiPackage className="text-purple-600" /> Sản phẩm ({order.items?.length || 0})</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                    <th className="pb-3 font-medium">Sản phẩm</th>
                    <th className="pb-3 font-medium text-center">Đơn giá</th>
                    <th className="pb-3 font-medium text-center">SL</th>
                    <th className="pb-3 font-medium text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="py-4">
                        <div className="font-bold">{item.productName}</div>
                        <div className="text-md text-slate-500">{item.variantName}</div>
                      </td>
                      <td className="py-4 text-center font-medium">{formatPrice(item.unitPrice)}</td>
                      <td className="py-4 text-center font-medium">{item.quantity}</td>
                      <td className="py-4 text-right font-bold text-purple-600">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Ghi chú</h2>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-md border border-yellow-100 dark:border-yellow-900/50">
              {order.note || 'Không có ghi chú.'}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><FiUser className="text-purple-600" /> Khách hàng</h2>
            <div className="space-y-3 text-md">
              {order.customerName && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Họ tên:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}
              {order.customerEmail && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-purple-600">{order.customerEmail}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">SĐT:</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><FiMapPin className="text-orange-600" /> Giao hàng</h2>
            <p className="text-md text-body leading-relaxed">{order.shippingAddress}</p>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiCreditCard className="text-green-600" /> Thanh toán</h2>
            <div className="space-y-3 text-md">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Trạng thái:</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              {order.couponCode && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Mã giảm giá:</span>
                  <span className="font-mono font-bold text-purple-600">{order.couponCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary / Total */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Tổng thanh toán</h2>
            <div className="space-y-3 text-md">
              <div className="flex justify-between text-slate-500"><span>Tạm tính</span><span className="font-medium text-slate-900 dark:text-white">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Phí vận chuyển</span><span className="font-medium text-slate-900 dark:text-white">{formatPrice(order.shippingFee)}</span></div>
              {(order.discountAmount || 0) > 0 && <div className="flex justify-between text-slate-500"><span>Giảm giá sản phẩm</span><span className="font-medium text-red-500">-{formatPrice(order.discountAmount)}</span></div>}
              {(order.shippingDiscountAmount || 0) > 0 && <div className="flex justify-between text-slate-500"><span>Giảm phí vận chuyển</span><span className="font-medium text-red-500">-{formatPrice(order.shippingDiscountAmount!)}</span></div>}
              {(order.taxAmount || 0) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Thuế VAT ({order.taxPercent ?? 0}%{order.taxMode === 'INCLUDED' ? ', đã gồm' : ''})</span>
                  <span className={`font-medium ${order.taxMode === 'EXCLUDED' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    {order.taxMode === 'EXCLUDED' ? '+' : ''}{formatPrice(order.taxAmount!)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-100 dark:border-slate-800 text-purple-600">
                <span>Tổng cộng</span><span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ===== PRINT INVOICE TEMPLATE ===== */}
    <div className="hidden print:block w-full text-black bg-white p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2 text-[#2539e6]">{shop.shopName}</h2>
          <p className="text-md">{shop.address}</p>
          <p className="text-md">SĐT: {shop.hotline}</p>
          <p className="text-md">Email: {shop.shopEmail}</p>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-[#2539e6]">Hóa Đơn</h1>
          <p className="font-bold text-lg mt-2 font-mono">#{order.orderNumber}</p>
          <p className="text-md text-slate-600">Ngày: {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="mb-8 border-t border-slate-200 pt-6 flex justify-between">
        <div>
          <h3 className="font-bold text-slate-500 uppercase text-sm mb-2">Khách hàng</h3>
          <p className="font-bold text-base">{order.customerName}</p>
          <p className="text-md">{order.shippingAddress || 'Nhận tại cửa hàng'}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-slate-500 uppercase text-sm mb-2">Thanh toán & Giao hàng</h3>
          <p className="text-md"><strong>Phương thức:</strong> {order.paymentMethod}</p>
          <p className="text-md"><strong>Trạng thái:</strong> {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thu tiền'}</p>
        </div>
      </div>

      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-800 text-md">
            <th className="py-2 font-bold">Sản phẩm</th>
            <th className="py-2 font-bold text-center">SL</th>
            <th className="py-2 font-bold text-right">Đơn giá</th>
            <th className="py-2 font-bold text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="text-md">
          {order.items?.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="py-3 pr-4">
                <div className="font-medium text-base">{item.productName}</div>
                {item.variantName && (
                  <div className="text-sm mt-1 italic">N/L: {item.variantName}</div>
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
          <div className="flex justify-between"><span>Tạm tính:</span> <span>{formatPrice(order.subtotal + order.shippingFee)}</span></div>
          {(order.discountAmount || 0) > 0 && <div className="flex justify-between"><span>Giảm giá sản phẩm:</span> <span>-{formatPrice(order.discountAmount!)}</span></div>}
          {(order.shippingDiscountAmount || 0) > 0 && <div className="flex justify-between"><span>Giảm phí vận chuyển:</span> <span>-{formatPrice(order.shippingDiscountAmount!)}</span></div>}
          {(order.taxAmount || 0) > 0 && (
            <div className="flex justify-between">
              <span>Thuế VAT ({order.taxPercent ?? 0}%{order.taxMode === 'INCLUDED' ? ', đã gồm' : ''}):</span>
              <span>{order.taxMode === 'EXCLUDED' ? '+' : ''}{formatPrice(order.taxAmount!)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-slate-800 mt-2">
            <span>Tổng cộng:</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-center mx-12 mt-16 text-md">
        <div>
          <p className="font-bold mb-24">Người mua hàng</p>
          <p className="text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold mb-24">Người bán hàng</p>
          <p className="text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="mt-20 text-center text-sm text-slate-500 border-t border-slate-200 pt-4">
        Cảm ơn quý khách đã mua bán tại {shop.shopName}!
      </div>
    </div>
    </>
  );
}
