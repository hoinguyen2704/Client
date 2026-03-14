import { useState } from 'react';
import { FiBell, FiLock, FiSmartphone, FiMail, FiShield, FiKey, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion } from 'motion/react';

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
                <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.email ? 'left-7' : 'left-1'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notifications.email} onChange={() => handleNotificationChange('email')} />
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
                <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications.sms ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.sms ? 'left-7' : 'left-1'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notifications.sms} onChange={() => handleNotificationChange('sms')} />
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
                <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications.app ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.app ? 'left-7' : 'left-1'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notifications.app} onChange={() => handleNotificationChange('app')} />
              </label>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Loại thông báo</h3>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Cập nhật đơn hàng</p>
                  <p className="text-sm text-slate-500">Trạng thái giao hàng, thanh toán</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications.orders ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.orders ? 'left-7' : 'left-1'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notifications.orders} onChange={() => handleNotificationChange('orders')} />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Khuyến mãi & Ưu đãi</p>
                  <p className="text-sm text-slate-500">Mã giảm giá, chương trình sale</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications.promotions ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.promotions ? 'left-7' : 'left-1'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={notifications.promotions} onChange={() => handleNotificationChange('promotions')} />
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
                  <button 
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isChangingPassword ? 'Hủy' : 'Đổi mật khẩu'}
                  </button>
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
                    <button type="button" className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                      Lưu mật khẩu mới
                    </button>
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
                <label className="cursor-pointer">
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${twoFactor ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${twoFactor ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <input type="checkbox" className="hidden" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                </label>
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
                <button className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">Hủy liên kết</button>
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
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Liên kết ngay</button>
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
                <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm">
                  Yêu cầu xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
