import { useState } from 'react';
import { FiBell, FiPackage, FiTag, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

const mockNotifications = [
  {
    id: 1,
    type: 'order',
    title: 'Đơn hàng đang được giao',
    message: 'Đơn hàng ORD-20231101-042 của bạn đang trên đường giao đến. Vui lòng chú ý điện thoại.',
    date: '10 phút trước',
    read: false,
    icon: <FiPackage className="text-blue-600" />,
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 2,
    type: 'promotion',
    title: 'Flash Sale 11.11 Sắp Bắt Đầu!',
    message: 'Chỉ còn 2 tiếng nữa, hàng ngàn deal sốc giảm đến 50% sẽ được mở bán. Đừng bỏ lỡ!',
    date: '2 giờ trước',
    read: false,
    icon: <FiTag className="text-orange-600" />,
    bg: 'bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 3,
    type: 'system',
    title: 'Cập nhật chính sách bảo mật',
    message: 'Hozitech đã cập nhật chính sách bảo mật mới. Vui lòng xem chi tiết tại đây.',
    date: 'Hôm qua',
    read: true,
    icon: <FiInfo className="text-purple-600" />,
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    id: 4,
    type: 'order',
    title: 'Giao hàng thành công',
    message: 'Đơn hàng ORD-20231025-001 đã được giao thành công. Đừng quên đánh giá sản phẩm nhé!',
    date: '25/10/2023',
    read: true,
    icon: <FiCheckCircle className="text-green-600" />,
    bg: 'bg-green-100 dark:bg-green-900/30'
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Thông báo 
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-bold">
              {unreadCount} mới
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium text-sm"
          >
            <FiCheckCircle /> Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <motion.div 
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border transition-all flex gap-4 cursor-pointer hover:shadow-md ${
                  !notification.read 
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10' 
                    : 'border-slate-100 dark:border-slate-800'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                {!notification.read && (
                  <div className="absolute top-6 right-6 w-3 h-3 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></div>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${notification.bg}`}>
                  {notification.icon}
                </div>
                
                <div className="flex-1 pr-8">
                  <h3 className={`font-bold text-lg mb-1 ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notification.title}
                  </h3>
                  <p className={`text-sm mb-2 ${!notification.read ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">{notification.date}</span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="absolute bottom-6 right-6 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  Xóa
                </button>
              </motion.div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-4xl">
                <FiBell />
              </div>
              <h3 className="text-xl font-bold mb-2">Không có thông báo nào</h3>
              <p className="text-slate-500 mb-6">Bạn đã xem hết tất cả thông báo.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
