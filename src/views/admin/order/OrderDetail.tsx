import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiUser, FiMapPin, FiCreditCard, FiPackage, FiX } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import StatusBadge from '@/components/ui/StatusBadge';
import adminOrderService from '@/apis/services/adminOrderService';
import type { OrderResponse } from '@/types';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Admin getAll with keyword=orderId to get single order (or direct endpoint if available)
    adminOrderService.getAll({ keyword: id, page: 1, size: 1 })
      .then(res => {
        const found = res.data.data?.[0];
        if (found) { setOrder(found); setEditStatus(found.orderStatus); }
      })
      .catch(err => console.error('Failed:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    try {
      const res = await adminOrderService.updateStatus(order.id, editStatus);
      setOrder(res.data);
      setIsStatusModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString('vi-VN'); } catch { return d; }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Đơn hàng {order.orderNumber}
              <StatusBadge status={order.orderStatus} />
            </h1>
            <p className="text-slate-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <FiPrinter /> In hóa đơn
          </button>
          <button onClick={() => setIsStatusModalOpen(true)} className="btn btn-md btn-primary">
            Cập nhật trạng thái
          </button>
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
                <div className="flex justify-between text-slate-500"><span>Giảm giá</span><span className="font-medium text-red-500">-{formatPrice(order.discountAmount)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-100 dark:border-slate-800 text-purple-600">
                  <span>Tổng cộng</span><span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
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
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
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

      {/* Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Cập nhật trạng thái</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600"><FiX className="text-xl" /></button>
            </div>
            <div className="p-6">
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="PENDING">Chờ xử lý</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="SHIPPING">Đang giao</option>
                <option value="DELIVERED">Đã giao</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsStatusModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors">Hủy</button>
              <button onClick={handleUpdateStatus} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
