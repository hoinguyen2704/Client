import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiXCircle, FiCheck, FiTruck, FiClock } from 'react-icons/fi';
import { formatPrice, formatDateFull as formatDate } from '@/utils/format';
import orderService from '@/apis/services/orderService';
import type { OrderResponse } from '@/types';

import { ORDER_TRACKING_STEPS, ORDER_STATUS_INDEX } from '@/constants/orderConstants';
import { BackButton } from '@/components/ui';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService.getByNumber(id).then(res => setOrder(res.data)).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);
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
      <FiXCircle className="text-6xl text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
      <Link to="/user/orders" className="text-purple-600 hover:underline">← Quay lại danh sách đơn hàng</Link>
    </div>
  );

  const currentStep = ORDER_STATUS_INDEX[order.orderStatus] ?? -1;
  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton to="/user/orders" />
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.orderNumber}</h1>
      </div>

      {/* Tracking Header */}
      {!isCancelled && order.trackingCode && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Thông tin vận chuyển</h2>
              <p className="text-slate-500 mt-1">Mã vận đơn: <span className="font-semibold text-slate-800 dark:text-slate-200">{order.trackingCode}</span></p>
            </div>
            <FiTruck className="text-3xl text-purple-600 opacity-20" />
          </div>
        </div>
      )}

      {/* Vertical Timeline */}
      {!isCancelled && order.statusHistories && order.statusHistories.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="relative">
            {order.statusHistories.map((history, idx) => {
              const time = new Date(history.createdAt);
              const isFirst = idx === 0;
              const isLast = idx === order.statusHistories!.length - 1;

              return (
                <div key={history.id} className="flex gap-4">
                  {/* Left: Time */}
                  <div className="w-20 flex-shrink-0 text-right pt-1">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
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
                    <h4 className={`text-base font-medium ${isFirst ? 'text-purple-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {history.status === 'SHIPPED' ? 'Giao hàng thành công' : history.description}
                    </h4>
                    {isFirst && history.status === 'SHIPPED' && (
                      <div className="inline-flex items-center gap-1 text-sm text-purple-600 mt-1 cursor-pointer hover:underline">
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

      {/* Fallback progress bar for legacy orders without histories */}
      {!isCancelled && (!order.statusHistories || order.statusHistories.length === 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {ORDER_TRACKING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx <= currentStep;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && <div className={`absolute top-5 right-1/2 w-full h-0.5 ${idx <= currentStep ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <Icon />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-purple-600' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800 text-red-600">
          <div className="flex items-center gap-3"><FiXCircle className="text-2xl" /><span className="font-bold text-lg">Đơn hàng đã {order.orderStatus === 'CANCELLED' ? 'bị hủy' : 'hoàn trả'}</span></div>
        </div>
      )}

      {/* Order Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <FiPackage className="text-slate-400 text-xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.productName}</h4>
                    <p className="text-sm text-slate-500">{item.variantName} | x{item.quantity}</p>
                  </div>
                  <div className="font-bold text-purple-600">{formatPrice(item.subtotal)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Ngày đặt</span><span className="font-medium">{formatDate(order.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Cập nhật lần cuối</span><span className="font-medium">{formatDate(order.updatedAt || order.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thanh toán</span><span className="font-medium">{order.paymentMethod}</span></div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phí ship</span><span>{formatPrice(order.shippingFee)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm giá</span><span className="text-green-600">-{formatPrice(order.discountAmount)}</span></div>}
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between text-lg"><span className="font-bold">Tổng cộng</span><span className="font-bold text-purple-600">{formatPrice(order.totalAmount)}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-3">Địa chỉ giao hàng</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{order.shippingAddress}</p>
          </div>

          {order.note && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-3">Ghi chú</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
