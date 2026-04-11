import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiXCircle, FiCheck, FiTruck, FiClock } from 'react-icons/fi';
import { formatPrice, formatDateFull as formatDate } from '@/utils/format';
import orderService from '@/apis/services/orderService';
import returnService from '@/apis/services/returnService';
import type { OrderResponse, ReturnRequestResponse } from '@/types';

import { ORDER_TRACKING_STEPS, ORDER_STATUS_INDEX } from '@/constants/orderConstants';
import { BackButton, Button, PrimaryButton, QuantitySelector } from '@/components';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';



export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReturn, setActiveReturn] = useState<ReturnRequestResponse | null>(null);

  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [returnItemQuantities, setReturnItemQuantities] = useState<Record<string, number>>({});
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, boolean>>({});
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const QUICK_REASONS = [
    'Sản phẩm bị lỗi / hỏng',
    'Giao sai sản phẩm',
    'Sản phẩm không đúng mô tả',
    'Không còn nhu cầu sử dụng',
    'Phụ kiện / linh kiện thiếu',
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
    if (!id) return;
    setLoading(true);
    orderService.getByNumber(id).then(res => {
      setOrder(res.data);
      if (res.data.orderStatus === 'SHIPPED') {
        fetchReturnStatus(res.data.orderNumber);
      }
    }).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);

  const handleStartReturn = () => {
    if (!order) return;
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

  const handleSubmitReturn = async () => {
    if (!order) return;
    if (!returnReason.trim()) {
      toast.error('Vui lòng nhập lý do trả hàng');
      return;
    }

    const itemsPayload = order.items
      .filter(item => selectedReturnItems[item.id])
      .map(item => ({ orderItemId: item.id, quantity: returnItemQuantities[item.id] || 0 }))
      .filter(item => item.quantity > 0);

    if (itemsPayload.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm cần trả');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const idempotencyKey = typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : `ret-${Date.now()}`;
      await returnService.create({
        orderId: order.id,
        reason: returnReason.trim(),
        evidenceNote: returnNote.trim() || undefined,
        items: itemsPayload,
      }, idempotencyKey);
      
      toast.success('Đã gửi yêu cầu trả hàng thành công');
      setIsReturning(false);
      fetchReturnStatus(order.orderNumber);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Tạo yêu cầu trả hàng thất bại'));
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
      <FiXCircle className="text-6xl text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
      <Link to="/user/orders" className="text-purple-600 hover:underline">← Quay lại danh sách đơn hàng</Link>
    </div>
  );

  const currentStep = ORDER_STATUS_INDEX[order.orderStatus] ?? -1;
  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED';

  const allowReturnBtn = order.orderStatus === 'SHIPPED' && order.paymentStatus === 'COMPLETED' && !activeReturn && !isReturning;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/user/orders" />
          <h1 className="text-xl sm:text-2xl font-bold">Chi tiết đơn hàng #{order.orderNumber}</h1>
        </div>
        {allowReturnBtn && (
          <Button onClick={handleStartReturn} variant="outline" className="text-purple-600 border-purple-600 whitespace-nowrap">
            Yêu cầu trả hàng
          </Button>
        )}
      </div>

      {/* Return Active Banner */}
      {activeReturn && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 sm:p-6 shadow-sm border border-purple-100 dark:border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300 flex-shrink-0">
              <FiPackage className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-purple-800 dark:text-purple-200">Đơn hàng đang có yêu cầu trả hàng</h3>
              <p className="text-md text-purple-600 dark:text-purple-300 mt-0.5">Tiến trình xử lý đang diễn ra. Vui lòng kiểm tra chi tiết.</p>
            </div>
          </div>
          <Link to={`/user/returns`} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-md font-semibold text-purple-600 shadow-sm border border-purple-100 dark:border-slate-700 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700">
            Xem chi tiết
          </Link>
        </div>
      )}

      {/* Inline Return Form */}
      {isReturning && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-purple-600">Tạo yêu cầu trả hàng</h2>
            <Button variant="secondary" className="text-slate-500" onClick={() => setIsReturning(false)}>Hủy bỏ</Button>
          </div>

          <div className="space-y-4">
            <div className="font-semibold flex items-center gap-2"><FiPackage className="text-purple-600" /> Chọn sản phẩm & số lượng muốn trả:</div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {order.items.map(line => (
                <div key={line.id} className={`p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors ${selectedReturnItems[line.id] ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={!!selectedReturnItems[line.id]}
                      onChange={(e) => setSelectedReturnItems(prev => ({ ...prev, [line.id]: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                    />
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      {line.imageUrl ? <img src={line.imageUrl} alt={line.productName} className="w-full h-full object-cover" /> : <FiPackage className="text-slate-400 text-xl" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold line-clamp-1">{line.productName}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {line.variantName} | Đã mua: {line.quantity} | {formatPrice(Number(line.unitPrice || 0))}
                    </p>
                  </div>
                  <div className={`flex items-center gap-3 transition-opacity ${selectedReturnItems[line.id] ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <span className="text-md font-medium text-slate-500">Số lượng:</span>
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
            <label className="block text-md font-semibold mb-2">Lý do trả hàng <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setReturnReason(reason)}
                  className={`px-3 py-1.5 rounded-full text-md font-medium transition-colors ${returnReason === reason ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 border border-transparent'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Hoặc nhập chi tiết lý do của bạn..."
              className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
          </div>

          <div>
            <label className="block text-md font-semibold mb-2">Mô tả thêm / Link ảnh (không bắt buộc)</label>
            <textarea
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="Cung cấp thêm thông tin hoặc link ảnh lưu trữ..."
              className="w-full h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-md outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <PrimaryButton onClick={handleSubmitReturn} isLoading={isSubmittingReturn} className="w-full sm:w-auto min-w-[200px]">
              Gửi yêu cầu trả hàng
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Order Layout (2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Header */}
          {!isCancelled && order.trackingCode &&(
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
                        <div className="text-md font-medium text-slate-800 dark:text-slate-200">
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
                        <h4 className={`text-base font-medium ${isFirst ? 'text-purple-600' : 'text-slate-600 dark:text-slate-400'}`}>
                          {history.status === 'SHIPPED' ? 'Giao hàng thành công' : history.description}
                        </h4>
                        {isFirst && history.status === 'SHIPPED' && (
                          <div className="inline-flex items-center gap-1 text-md text-purple-600 mt-1 cursor-pointer hover:underline">
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
                      <span className={`text-sm mt-2 font-medium ${isActive ? 'text-purple-600' : 'text-slate-400'}`}>{step.label}</span>
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

          {/* Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Sản phẩm</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <FiPackage className="text-slate-400 text-3xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate" title={item.productName}>
                      {item.productName}
                    </h4>
                    <p className="text-md text-slate-500 mt-0.5">
                      {item.variantName ? `${item.variantName} | ` : ''}Số lượng: x{item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <div className="text-md text-slate-500 mb-1">{formatPrice(Number(item.unitPrice || 0))}</div>
                    <div className="font-bold text-purple-600 text-lg">{formatPrice(item.subtotal)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3 text-md">
              <div className="flex justify-between"><span className="text-slate-500">Ngày đặt</span><span className="font-medium">{formatDate(order.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Cập nhật lần cuối</span><span className="font-medium">{formatDate(order.updatedAt || order.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thanh toán</span><span className="font-medium">{order.paymentMethod}</span></div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phí ship</span><span>{formatPrice(order.shippingFee)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm giá sản phẩm</span><span className="text-green-600">-{formatPrice(order.discountAmount)}</span></div>}
              {(order.shippingDiscountAmount || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm phí vận chuyển</span><span className="text-green-600">-{formatPrice(order.shippingDiscountAmount!)}</span></div>}
              {(order.taxAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Thuế VAT ({order.taxPercent ?? 0}%{order.taxMode === 'INCLUDED' ? ', đã gồm' : ''})
                  </span>
                  <span className={order.taxMode === 'EXCLUDED' ? '' : 'text-slate-500'}>
                    {order.taxMode === 'EXCLUDED' ? '+' : ''}{formatPrice(order.taxAmount!)}
                  </span>
                </div>
              )}
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between text-lg"><span className="font-bold">Tổng cộng</span><span className="font-bold text-purple-600">{formatPrice(order.totalAmount)}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-3">Địa chỉ giao hàng</h2>
            <p className="text-md text-slate-600 dark:text-slate-400">{order.shippingAddress}</p>
          </div>

          {order.note && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-3">Ghi chú</h2>
              <p className="text-md text-slate-600 dark:text-slate-400">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
