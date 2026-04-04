import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiUser, FiMapPin, FiCreditCard, FiPackage } from 'react-icons/fi';
import { formatPrice, formatDateTime as formatDate } from '@/utils/format';
import { Button, StatusBadge, CustomSelect, BackButton } from '@/components';
import { toast } from 'sonner';
import adminOrderService from '@/apis/services/adminOrderService';
import { ORDER_STATUS_OPTIONS } from '@/constants/orderConstants';

import type { OrderResponse } from '@/types';
import { SHOP } from '@/constants/shopConstants';
import { downloadBlob } from '@/utils/download';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
 const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Fetch individual order by orderNumber
    adminOrderService.getByNumber(id)
      .then(res => {
        const found = res.data;
        if (found) { setOrder(found); setEditStatus(found.orderStatus); }
      })
      .catch(err => console.error('Failed:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order || isUpdatingStatus || !newStatus || newStatus === order.orderStatus) return;
    const previousStatus = order.orderStatus;
    setEditStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      const res = await adminOrderService.updateStatus(order.id, newStatus);
      setOrder(res.data);
      setEditStatus(res.data.orderStatus);
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
    <div className="space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/admin/orders" />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Đơn hàng {order.orderNumber}
              <StatusBadge status={order.orderStatus} />
            </h1>
            <p className="text-slate-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="w-full sm:w-56">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Trạng thái đơn hàng</label>
            <CustomSelect
              value={editStatus || order.orderStatus}
              onChange={handleUpdateStatus}
              options={ORDER_STATUS_OPTIONS}
              className="w-full"
              disabled={isUpdatingStatus}
            />
          </div>
          <Button onClick={handleExportInvoice} variant="success" size="md" icon={<FiDownload />}>
            Tải hóa đơn PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6"><FiPackage className="text-purple-600" /> Sản phẩm ({order.items?.length || 0})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
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
                        <div className="text-sm text-slate-500">{item.variantName}</div>
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

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-4">Ghi chú</h2>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm border border-yellow-100 dark:border-yellow-900/50">
                {order.note || 'Không có ghi chú.'}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-4">Tổng thanh toán</h2>
              <div className="space-y-3 text-sm">
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><FiUser className="text-purple-600" /> Khách hàng</h2>
            <div className="space-y-3 text-sm">
              {order.customerName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Họ tên:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}
              {order.customerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-purple-600">{order.customerEmail}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SĐT:</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><FiMapPin className="text-orange-600" /> Giao hàng</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{order.shippingAddress}</p>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiCreditCard className="text-green-600" /> Thanh toán</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              {order.couponCode && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mã giảm giá:</span>
                  <span className="font-mono font-bold text-purple-600">{order.couponCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ===== PRINT INVOICE TEMPLATE ===== */}
    <div className="hidden print:block w-full text-black bg-white p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-2 text-[#2539e6]">{SHOP.fullName}</h2>
          <p className="text-sm">123 Đường Công Nghệ, Quận IT, TP.HCM</p>
          <p className="text-sm">SĐT: 0123.456.789</p>
          <p className="text-sm">Email: {SHOP.email}</p>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-[#2539e6]">Hóa Đơn</h1>
          <p className="font-bold text-lg mt-2 font-mono">#{order.orderNumber}</p>
          <p className="text-sm text-slate-600">Ngày: {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="mb-8 border-t border-slate-200 pt-6 flex justify-between">
        <div>
          <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Khách hàng</h3>
          <p className="font-bold text-base">{order.customerName}</p>
          <p className="text-sm">{order.shippingAddress || 'Nhận tại cửa hàng'}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Thanh toán & Giao hàng</h3>
          <p className="text-sm"><strong>Phương thức:</strong> {order.paymentMethod}</p>
          <p className="text-sm"><strong>Trạng thái:</strong> {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thu tiền'}</p>
        </div>
      </div>

      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-800 text-sm">
            <th className="py-2 font-bold">Sản phẩm</th>
            <th className="py-2 font-bold text-center">SL</th>
            <th className="py-2 font-bold text-right">Đơn giá</th>
            <th className="py-2 font-bold text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {order.items?.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="py-3 pr-4">
                <div className="font-medium text-base">{item.productName}</div>
                {item.variantName && (
                  <div className="text-xs mt-1 italic">N/L: {item.variantName}</div>
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
        <div className="w-64 space-y-2 text-sm">
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

      <div className="flex justify-between text-center mx-12 mt-16 text-sm">
        <div>
          <p className="font-bold mb-24">Người mua hàng</p>
          <p className="text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold mb-24">Người bán hàng</p>
          <p className="text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="mt-20 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
        Cảm ơn quý khách đã mua bán tại {SHOP.fullName}!
      </div>
    </div>
    </>
  );
}
