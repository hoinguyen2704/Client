import { useState } from 'react';
import { FiBell, FiLock, FiSmartphone, FiMail, FiShield, FiKey, FiAlertTriangle, FiSun, FiGlobe, FiLoader } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';
import { Button, SwitchToggle, CustomSelect } from '@/components';
import useUIStore from '@/stores/useUIStore';
import useAuthStore from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import userService from '@/apis/services/userService';

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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const user = useAuthStore(s => s.user);
  const { darkMode, toggleDarkMode, language, setLanguage } = useUIStore();
  const { t } = useTranslation('settings');

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Display Options */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
              {t('displayOptions.title')}
            </h2>
            
            <div className="space-y-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                    <FiSun className="text-lg" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('displayOptions.darkMode')}</p>
                </div>
                <SwitchToggle
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  tone="slate"
                  ariaLabel="Bật tắt chế độ tối"
                />
              </label>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 transition-colors">
                    <FiGlobe className="text-lg" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('displayOptions.language')}</p>
                </div>
                <div className="w-40 h-9">
                  <CustomSelect
                    value={language}
                    onChange={(v) => setLanguage(v as 'vi' | 'en')}
                    options={[
                      { value: 'vi', label: 'Tiếng Việt', colorClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200" },
                      { value: 'en', label: 'English', colorClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200" }
                    ]}
                    dropdownAlign="right"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 transition-colors">
                    <FiBell className="text-lg" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('displayOptions.promotions')}</p>
                </div>
                <SwitchToggle
                  checked={notifications.promotions}
                  onChange={() => handleNotificationChange('promotions')}
                  tone="purple"
                  ariaLabel="Bật tắt thông báo khuyến mãi"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
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
                    <p className="text-md text-slate-500">Nhận thông báo qua email</p>
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
                    <p className="text-md text-slate-500">Nhận tin nhắn văn bản</p>
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
                    <p className="text-md text-slate-500">Nhận thông báo trên ứng dụng</p>
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
                  <p className="text-md text-slate-500">Trạng thái giao hàng, thanh toán</p>
                </div>
                <SwitchToggle
                  checked={notifications.orders}
                  onChange={() => handleNotificationChange('orders')}
                  tone="blue"
                  ariaLabel="Bật tắt thông báo đơn hàng"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

        <div className="space-y-8">
          {/* Security */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
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
                      <p className="text-md text-slate-500">Cập nhật lần cuối: 30 ngày trước</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    variant="outline"
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
                      <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu hiện tại</label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu mới</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-1">Xác nhận mật khẩu mới</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <Button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      icon={savingPassword ? <FiLoader className="animate-spin" /> : undefined}
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="h-10 from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                    >
                      {savingPassword ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}
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
                    <p className="text-md text-slate-500">Tăng cường bảo mật tài khoản</p>
                  </div>
                </div>
                <SwitchToggle
                  checked={twoFactor}
                  onChange={setTwoFactor}
                  tone="success"
                  ariaLabel="Bật tắt xác thực 2 lớp"
                />
              </div>

              <AnimatePresence>
                {twoFactor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center mt-4">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Hozitech:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=Hozitech`} alt="QR Code" className="w-32 h-32 mb-4 rounded-lg bg-white p-2" />
                      <p className="text-md text-slate-600 dark:text-slate-400 mb-4">Quét mã QR này bằng ứng dụng Google Authenticator hoặc Authy để thiết lập 2FA.</p>
                      <div className="flex gap-2 w-full">
                        <input type="text" placeholder="Nhập mã 6 số..." className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono" maxLength={6} />
                        <Button variant="success" size="sm" className="px-4 bg-blue-600 hover:bg-blue-700 text-white border-0">Xác nhận</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Social Accounts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Liên kết tài khoản</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-sm">
                    <FaGoogle />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Google</p>
                    <p className="text-md text-slate-500">Đã liên kết</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-md text-slate-500 hover:text-red-500"
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
                    <p className="text-md text-slate-500">Chưa liên kết</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-md text-blue-600 hover:text-blue-700"
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
                <p className="text-md text-red-500/80 dark:text-red-400/80 mb-4">
                  Khi xóa tài khoản, tất cả dữ liệu cá nhân, lịch sử đơn hàng và điểm tích lũy sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </p>
                <Button variant="danger" size="sm" className="px-4 text-md">
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
