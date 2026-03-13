import { useState } from 'react';
import { FiCamera, FiLock, FiShield, FiMoon, FiSun, FiGlobe, FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg group">
              <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" className="w-full h-full rounded-full object-cover" />
              <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white transition-opacity">
                <FiCamera className="text-2xl" />
              </button>
            </div>
            <button className="text-sm font-medium text-purple-600 hover:underline">Thay đổi ảnh đại diện</button>
          </div>

          {/* Profile Form */}
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Họ và tên</label>
                <input type="text" defaultValue="Nguyễn Văn A" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Email (Không thể thay đổi)</label>
                <input type="email" defaultValue="nguyenvana@example.com" readOnly className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Số điện thoại</label>
                <input type="tel" defaultValue="0987654321" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Ngày sinh</label>
                <input type="date" defaultValue="1990-01-01" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            
            <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
              <FiLock />
            </div>
            <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
              <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
              <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
              <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors mt-4">
              Cập nhật mật khẩu
            </button>
          </div>
        </div>

        {/* Security & Preferences */}
        <div className="space-y-8">
          {/* 2FA */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                  <FiShield />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Xác thực 2 lớp (2FA)</h2>
                  <p className="text-sm text-slate-500">Tăng cường bảo mật tài khoản</p>
                </div>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${is2FAEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <motion.div 
                  layout
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                  animate={{ x: is2FAEnabled ? 24 : 0 }}
                />
              </button>
            </div>
            
            <AnimatePresence>
              {is2FAEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Hozitech:nguyenvana@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Hozitech" alt="QR Code" className="w-32 h-32 mb-4 rounded-lg bg-white p-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Quét mã QR này bằng ứng dụng Google Authenticator hoặc Authy để thiết lập 2FA.</p>
                    <div className="flex gap-2 w-full">
                      <input type="text" placeholder="Nhập mã 6 số..." className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-center tracking-widest font-mono" maxLength={6} />
                      <button className="px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors">Xác nhận</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6">Tùy chọn hiển thị</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xl">
                    {isDarkMode ? <FiMoon /> : <FiSun />}
                  </div>
                  <span className="font-medium">Chế độ tối (Dark Mode)</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div 
                    layout
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                    animate={{ x: isDarkMode ? 24 : 0 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                    <FiGlobe />
                  </div>
                  <span className="font-medium">Ngôn ngữ</span>
                </div>
                <select className="h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl">
                    <FiBell />
                  </div>
                  <span className="font-medium">Nhận thông báo khuyến mãi</span>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div 
                    layout
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                    animate={{ x: notificationsEnabled ? 24 : 0 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
