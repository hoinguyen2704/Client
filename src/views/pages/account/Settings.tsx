import { useState } from 'react';
import { FiBell, FiLock, FiSmartphone, FiMail, FiShield, FiKey, FiAlertTriangle } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion } from 'motion/react';
import { Button, SwitchToggle } from '@/components';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    app: true,
    promotions: true,
    orders: true
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt tài khoản</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <FiBell />
            </div>
            Cài đặt thông báo
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Kênh nhận thông báo</h3>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                    <FiMail />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Email</p>
                    <p className="text-sm text-slate-500">Nhận thông báo qua email</p>
                  </div>
                </div>
                <SwitchToggle
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  tone="blue"
                  ariaLabel="Bật tắt thông báo email"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                    <FiSmartphone />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">SMS</p>
                    <p className="text-sm text-slate-500">Nhận tin nhắn văn bản</p>
                  </div>
                </div>
                <SwitchToggle
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                  tone="blue"
                  ariaLabel="Bật tắt thông báo SMS"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                    <FiBell />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Thông báo đẩy (App)</p>
                    <p className="text-sm text-slate-500">Nhận thông báo trên ứng dụng</p>
                  </div>
                </div>
                <SwitchToggle
                  checked={notifications.app}
                  onChange={() => handleNotificationChange('app')}
                  tone="blue"
                  ariaLabel="Bật tắt thông báo ứng dụng"
                />
              </label>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Loại thông báo</h3>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Cập nhật đơn hàng</p>
                  <p className="text-sm text-slate-500">Trạng thái giao hàng, thanh toán</p>
                </div>
                <SwitchToggle
                  checked={notifications.orders}
                  onChange={() => handleNotificationChange('orders')}
                  tone="blue"
                  ariaLabel="Bật tắt thông báo đơn hàng"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Khuyến mãi & Ưu đãi</p>
                  <p className="text-sm text-slate-500">Mã giảm giá, chương trình sale</p>
                </div>
                <SwitchToggle
                  checked={notifications.promotions}
                  onChange={() => handleNotificationChange('promotions')}
                  tone="blue"
                  ariaLabel="Bật tắt thông báo khuyến mãi"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Security */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                <FiShield />
              </div>
              Bảo mật
            </h2>
            
            <div className="space-y-6">
              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <FiKey />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Mật khẩu</p>
                      <p className="text-sm text-slate-500">Cập nhật lần cuối: 30 ngày trước</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    variant="secondary"
                    size="sm"
                    className="px-4 border border-slate-200 dark:border-slate-700"
                  >
                    {isChangingPassword ? 'Hủy' : 'Đổi mật khẩu'}
                  </Button>
                </div>

                {isChangingPassword && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu hiện tại</label>
                      <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu mới</label>
                      <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Xác nhận mật khẩu mới</label>
                      <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="h-10 from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                    >
                      Lưu mật khẩu mới
                    </Button>
                  </motion.form>
                )}
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <FiLock />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Xác thực 2 bước (2FA)</p>
                    <p className="text-sm text-slate-500">Tăng cường bảo mật tài khoản</p>
                  </div>
                </div>
                <SwitchToggle
                  checked={twoFactor}
                  onChange={setTwoFactor}
                  tone="success"
                  ariaLabel="Bật tắt xác thực 2 lớp"
                />
              </div>
            </div>
          </div>

          {/* Social Accounts */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Liên kết tài khoản</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-sm">
                    <FaGoogle />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Google</p>
                    <p className="text-sm text-slate-500">Đã liên kết</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-slate-500 hover:text-red-500"
                >
                  Hủy liên kết
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-blue-600 shadow-sm">
                    <FaFacebook />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Facebook</p>
                    <p className="text-sm text-slate-500">Chưa liên kết</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Liên kết ngay
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center shrink-0">
                <FiAlertTriangle />
              </div>
              <div>
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-1">Xóa tài khoản</h3>
                <p className="text-sm text-red-500/80 dark:text-red-400/80 mb-4">
                  Khi xóa tài khoản, tất cả dữ liệu cá nhân, lịch sử đơn hàng và điểm tích lũy sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </p>
                <Button variant="danger" size="sm" className="px-4 text-sm">
                  Yêu cầu xóa tài khoản
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
