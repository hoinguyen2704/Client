import { useState, useEffect, useRef } from 'react';
import { FiCamera, FiLock, FiShield, FiMoon, FiSun, FiGlobe, FiBell, FiLoader, FiSave, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import userService from '@/apis/services/userService';
import useUIStore from '@/stores/useUIStore';
import useAuthStore from '@/stores/useAuthStore';
import { Button, CustomSelect, SwitchToggle } from '@/components';
import type { UserResponse } from '@/types';

export default function Profile() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { darkMode: isDarkMode, toggleDarkMode } = useUIStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      const u = res.data;
      setUser(u);
      setFullName(u.fullName || '');
      setDateOfBirth(u.dateOfBirth || '');
      setGender(u.gender || '');
    } catch {
      toast.error('Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Họ và tên không được để trống.');
      return;
    }
    setSaving(true);
    try {
      const res = await userService.updateProfile({
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      });
      setUser(res.data);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const res = await userService.uploadAvatar(file);
      const newUrl = res.data.avatarUrl;

      // Preload the image so spinner stays until it's fully loaded
      if (newUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // resolve anyway to not block forever
          img.src = newUrl;
        });
      }

      setUser(res.data);
      useAuthStore.getState().updateUser({ avatar: newUrl });
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch {
      toast.error('Upload ảnh thất bại.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg group flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide broken image tag, show fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center ${user?.avatarUrl ? 'hidden' : ''}`}>
                <FiUser className="text-5xl text-purple-500 dark:text-purple-400" />
              </div>
              {/* Upload loading overlay */}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white z-10">
                  <FiLoader className="text-3xl animate-spin mb-1" />
                  <span className="text-[10px] font-medium">Đang tải...</span>
                </div>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white transition-opacity ${uploadingAvatar ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <FiCamera className="text-2xl" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
            <Button
              onClick={() => avatarInputRef.current?.click()}
              variant="ghost"
              size="sm"
              className="text-sm text-purple-600 hover:underline"
            >
              Thay đổi ảnh đại diện
            </Button>
          </div>

          {/* Profile Form */}
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Email (Không thể thay đổi)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Số điện thoại</label>
                <input
                  type="tel"
                  value={user?.phoneNumber || ''}
                  readOnly
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Ngày sinh</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Giới tính</label>
                <CustomSelect
                  value={gender}
                  onChange={(v) => setGender(v)}
                  className="w-full h-12"
                  options={[
                    { value: '', label: 'Chưa chọn' },
                    { value: 'MALE', label: 'Nam' },
                    { value: 'FEMALE', label: 'Nữ' },
                    { value: 'OTHER', label: 'Khác' }
                  ]}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              icon={saving ? <FiLoader className="animate-spin" /> : <FiSave />}
              size="lg"
              className="h-12 px-6"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
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
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={savingPassword}
              icon={savingPassword ? <FiLoader className="animate-spin" /> : undefined}
              variant="secondary"
              size="md"
              fullWidth
              className="mt-4 bg-slate-900 dark:bg-slate-700 text-white hover:bg-purple-600 dark:hover:bg-purple-600"
            >
              {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
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
              <SwitchToggle
                checked={is2FAEnabled}
                onChange={setIs2FAEnabled}
                tone="success"
                ariaLabel="Bật tắt xác thực 2 lớp"
              />
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
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Hozitech:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=Hozitech`} alt="QR Code" className="w-32 h-32 mb-4 rounded-lg bg-white p-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Quét mã QR này bằng ứng dụng Google Authenticator hoặc Authy để thiết lập 2FA.</p>
                    <div className="flex gap-2 w-full">
                      <input type="text" placeholder="Nhập mã 6 số..." className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-center tracking-widest font-mono" maxLength={6} />
                      <Button variant="success" size="sm" className="px-4">Xác nhận</Button>
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
                <SwitchToggle
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  tone="primary"
                  ariaLabel="Bật tắt chế độ tối"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                    <FiGlobe />
                  </div>
                  <span className="font-medium">Ngôn ngữ</span>
                </div>
                <CustomSelect
                  value="vi"
                  onChange={() => {}}
                  className="w-32 h-10"
                  options={[
                    { value: 'vi', label: 'Tiếng Việt' },
                    { value: 'en', label: 'English' }
                  ]}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl">
                    <FiBell />
                  </div>
                  <span className="font-medium">Nhận thông báo khuyến mãi</span>
                </div>
                <SwitchToggle
                  checked={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                  tone="primary"
                  ariaLabel="Bật tắt thông báo khuyến mãi"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
