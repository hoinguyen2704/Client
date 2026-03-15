import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi';
import { motion } from 'motion/react';
import { formatPrice } from '@/helpers/format';
import { mockOrderDetails } from '@/utils/mockAccount';

export default function OrderTracking() {
  const { id } = useParams();
  const order = mockOrderDetails; // In real app, fetch based on ID

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/user/orders" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng {id || order.id}</h1>
        </div>
        <button className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center gap-2">
          Tải hoá đơn PDF
        </button>
      </div>

      {/* Order Status Stepper */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${order.status === 'processing' || order.status === 'shipping' || order.status === 'completed' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
              <FiClock className="text-2xl" />
            </div>
            <p className="font-bold text-sm">Chờ xác nhận</p>
          </div>
          <div className={`hidden md:block flex-1 h-1 mx-4 rounded-full ${order.status === 'shipping' || order.status === 'completed' ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${order.status === 'shipping' || order.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
              <FiPackage className="text-2xl" />
            </div>
            <p className="font-bold text-sm">Đang chuẩn bị</p>
          </div>
          <div className={`hidden md:block flex-1 h-1 mx-4 rounded-full ${order.status === 'shipping' || order.status === 'completed' ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${order.status === 'shipping' || order.status === 'completed' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
              <FiTruck className="text-2xl" />
            </div>
            <p className="font-bold text-sm">Đang giao</p>
          </div>
          <div className={`hidden md:block flex-1 h-1 mx-4 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
              <FiCheckCircle className="text-2xl" />
            </div>
            <p className="font-bold text-sm">Đã giao</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-6">Lịch sử giao hàng</h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {order.timeline.map((event, index) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.completed ? 'bg-purple-500 text-white' : ''} ${event.current ? 'ring-4 ring-purple-500/30' : ''}`}>
                  {event.completed ? <FiCheckCircle /> : <FiClock />}
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm ${event.current ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-slate-900'}`}>
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className={`font-bold text-slate-900 dark:text-white ${event.current ? 'text-purple-600 dark:text-purple-400' : ''}`}>{event.status}</div>
                    <time className="font-caveat font-medium text-sm text-slate-500">{event.date}</time>
                  </div>
                  <div className="text-slate-500 text-sm">{event.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiTruck className="text-purple-600" /> Thông tin vận chuyển</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị vận chuyển:</span>
                <span className="font-medium">{order.shippingProvider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã vận đơn:</span>
                <span className="font-medium text-purple-600">{order.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dự kiến giao:</span>
                <span className="font-medium">{order.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiMapPin className="text-purple-600" /> Địa chỉ nhận hàng</h2>
            <div className="space-y-2">
              <p className="font-bold">{order.shippingAddress.name}</p>
              <p className="text-slate-500">{order.shippingAddress.phone}</p>
              <p className="text-slate-700 dark:text-slate-300">{order.shippingAddress.address}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
            <div className="space-y-4 mb-4">
              {order.items.map(item => (
                <Link to={`/product/${item.slug}`} key={item.id} className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-xl transition-colors group">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-slate-50 dark:bg-slate-800" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.variant} | x{item.quantity}</p>
                  </div>
                  <div className="font-bold text-sm text-purple-600 text-right">
                    {formatPrice(item.price)}
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính</span>
                <span>{formatPrice(order.total - order.shippingFee + order.discount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Giảm giá</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-100 dark:border-slate-800 text-purple-600">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
            <p className="text-slate-700 dark:text-slate-300">{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
