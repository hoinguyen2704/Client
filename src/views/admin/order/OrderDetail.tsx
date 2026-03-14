import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiEdit, FiUser, FiMapPin, FiCreditCard, FiPackage, FiTruck, FiCheckCircle, FiX } from 'react-icons/fi';
import { formatPrice } from '@/utils/mockData';

const mockOrderDetails = {
  id: 'ORD-20231101-042',
  date: '01/11/2023 14:30',
  status: 'pending', // pending, verified, shipping, delivered, cancelled
  total: 15990000,
  subtotal: 15990000,
  shippingFee: 30000,
  discount: 30000,
  paymentMethod: 'Thanh toán khi nhận hàng (COD)',
  paymentStatus: 'Chưa thanh toán',
  customer: {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    totalOrders: 5,
  },
  shippingAddress: {
    name: 'Trần Thị B',
    phone: '0912345678',
    address: '456 Đường DEF, Phường UVW, Quận 3, TP. Hồ Chí Minh'
  },
  items: [
    {
      id: 2,
      name: 'iPad Air 5 M1 64GB',
      variant: 'Xanh dương',
      price: 15990000,
      quantity: 1,
      image: 'https://picsum.photos/seed/ipad/100/100',
      sku: 'IPAD-AIR5-BLU-64'
    }
  ],
  notes: 'Giao hàng trong giờ hành chính giúp mình nhé.'
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(mockOrderDetails); // In real app, fetch based on ID
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const [editAddress, setEditAddress] = useState(order.shippingAddress);
  const [editStatus, setEditStatus] = useState(order.status);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = () => {
    setOrder({ ...order, status: editStatus });
    setIsStatusModalOpen(false);
  };

  const handleUpdateAddress = () => {
    setOrder({ ...order, shippingAddress: editAddress });
    setIsAddressModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Đơn hàng {order.id}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                order.status === 'verified' ? 'bg-blue-100 text-blue-600' :
                order.status === 'shipping' ? 'bg-orange-100 text-orange-600' :
                'bg-red-100 text-red-600'
              }`}>
                {order.status === 'delivered' ? 'Đã giao' :
                 order.status === 'pending' ? 'Chờ xử lý' :
                 order.status === 'verified' ? 'Đã xác nhận' :
                 order.status === 'shipping' ? 'Đang giao' : 'Đã hủy'}
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{order.date}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <FiPrinter /> In hóa đơn
          </button>
          <button onClick={() => setIsStatusModalOpen(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            Cập nhật trạng thái
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><FiPackage className="text-purple-600" /> Sản phẩm ({order.items.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                    <th className="pb-3 font-medium">Sản phẩm</th>
                    <th className="pb-3 font-medium text-center">Đơn giá</th>
                    <th className="pb-3 font-medium text-center">Số lượng</th>
                    <th className="pb-3 font-medium text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
                          <div>
                            <div className="font-bold line-clamp-1">{item.name}</div>
                            <div className="text-sm text-slate-500">{item.variant} | SKU: {item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-medium">{formatPrice(item.price)}</td>
                      <td className="py-4 text-center font-medium">{item.quantity}</td>
                      <td className="py-4 text-right font-bold text-purple-600">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-4">Ghi chú của khách hàng</h2>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm leading-relaxed border border-yellow-100 dark:border-yellow-900/50">
                {order.notes || 'Không có ghi chú.'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-4">Tổng thanh toán</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatPrice(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Giảm giá</span>
                  <span className="font-medium text-red-500">-{formatPrice(order.discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-100 dark:border-slate-800 text-purple-600">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer, Shipping, Payment */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><FiUser className="text-blue-600" /> Khách hàng</h2>
              <Link to={`/admin/customers/1`} className="text-sm font-medium text-purple-600 hover:underline">Hồ sơ</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold">{order.customer.name}</div>
                <div className="text-sm text-slate-500">{order.customer.totalOrders} đơn hàng</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium">{order.customer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Điện thoại:</span>
                <span className="font-medium">{order.customer.phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><FiMapPin className="text-orange-600" /> Giao hàng</h2>
              <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-medium text-purple-600 hover:underline flex items-center gap-1">
                <FiEdit /> Sửa
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-bold">{order.shippingAddress.name}</p>
              <p className="text-slate-500">{order.shippingAddress.phone}</p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{order.shippingAddress.address}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><FiTruck /> Đơn vị vận chuyển:</span>
                <span className="font-bold">Giao Hàng Tiết Kiệm</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiCreditCard className="text-green-600" /> Thanh toán</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                  order.paymentStatus === 'Đã thanh toán' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Lịch sử đơn hàng</h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                <div className="text-sm font-bold">Chờ xử lý</div>
                <div className="text-xs text-slate-500">01/11/2023 14:30</div>
              </div>
              {['verified', 'shipping', 'delivered'].includes(order.status) && (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="text-sm font-bold text-blue-600">Đã xác nhận</div>
                  <div className="text-xs text-slate-500">01/11/2023 15:00</div>
                </div>
              )}
              {['shipping', 'delivered'].includes(order.status) && (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="text-sm font-bold text-orange-600">Đang giao hàng</div>
                  <div className="text-xs text-slate-500">02/11/2023 08:30</div>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="text-sm font-bold text-green-600">Đã giao thành công</div>
                  <div className="text-xs text-slate-500">03/11/2023 10:15</div>
                </div>
              )}
              {order.status === 'cancelled' && (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="text-sm font-bold text-red-600">Đã hủy</div>
                  <div className="text-xs text-slate-500">01/11/2023 16:00</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Cập nhật trạng thái</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Trạng thái đơn hàng</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="pending">Chờ xử lý (Pending)</option>
                  <option value="verified">Đã xác nhận (Verified)</option>
                  <option value="shipping">Đang giao (Shipping)</option>
                  <option value="delivered">Đã giao (Delivered)</option>
                  <option value="cancelled">Đã hủy (Cancelled)</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsStatusModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Hủy
              </button>
              <button onClick={handleUpdateStatus} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Sửa địa chỉ giao hàng</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên người nhận</label>
                <input 
                  type="text" 
                  value={editAddress.name}
                  onChange={(e) => setEditAddress({...editAddress, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                <input 
                  type="text" 
                  value={editAddress.phone}
                  onChange={(e) => setEditAddress({...editAddress, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Địa chỉ chi tiết</label>
                <textarea 
                  value={editAddress.address}
                  onChange={(e) => setEditAddress({...editAddress, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsAddressModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Hủy
              </button>
              <button onClick={handleUpdateAddress} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
