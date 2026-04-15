import { useState, useEffect, useRef } from 'react';
import { FiCamera, FiLock, FiShield, FiMoon, FiSun, FiGlobe, FiBell, FiLoader, FiSave, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import userService from '@/apis/services/userService';
import useUIStore from '@/stores/useUIStore';
import useAuthStore from '@/stores/useAuthStore';
import { Button, CustomSelect } from '@/components';
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
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmailChange, setPendingEmailChange] = useState<string | null>(null);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [resendingEmailOtp, setResendingEmailOtp] = useState(false);

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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Cập nhật hồ sơ thất bại.'));
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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRequestEmailChange = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error('Vui lòng nhập email mới.');
      return;
    }
    if (!emailChangePassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    setSendingEmailOtp(true);
    try {
      await userService.requestEmailChange({
        newEmail: normalizedEmail,
        currentPassword: emailChangePassword,
      });
      setPendingEmailChange(normalizedEmail);
      setOtpCode('');
      toast.success('Đã gửi OTP đến email mới.');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi OTP đổi email.'));
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (!pendingEmailChange) return;
    setResendingEmailOtp(true);
    try {
      await userService.resendEmailChangeOtp({ newEmail: pendingEmailChange });
      toast.success('Đã gửi lại OTP.');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi lại OTP.'));
    } finally {
      setResendingEmailOtp(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!pendingEmailChange) return;
    if (!otpCode.trim()) {
      toast.error('Vui lòng nhập mã OTP.');
      return;
    }

    setVerifyingEmailOtp(true);
    try {
      const res = await userService.verifyEmailChange({
        newEmail: pendingEmailChange,
        otpCode: otpCode.trim(),
      });
      setUser(res.data);
      useAuthStore.getState().updateUser({ email: res.data.email });
      toast.success('Đổi email thành công. Vui lòng đăng nhập lại.');
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 1000);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Xác thực OTP thất bại.'));
    } finally {
      setVerifyingEmailOtp(false);
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
                  <span className="text-10 font-medium">Đang tải...</span>
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
              className="text-md text-purple-600 hover:underline"
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

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-4 bg-slate-50/60 dark:bg-slate-800/30">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Đổi email qua OTP</h3>
                <p className="text-md text-slate-500 mt-1">
                  Nhập email mới và mật khẩu hiện tại để nhận OTP xác thực. Sau khi xác thực thành công, bạn sẽ cần đăng nhập lại.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Email mới</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={emailChangePassword}
                    onChange={(e) => setEmailChangePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleRequestEmailChange}
                  disabled={sendingEmailOtp}
                  icon={sendingEmailOtp ? <FiLoader className="animate-spin" /> : undefined}
                  size="md"
                >
                  {sendingEmailOtp ? 'Đang gửi OTP...' : 'Gửi OTP đổi email'}
                </Button>
                {pendingEmailChange && (
                  <span className="text-md text-slate-500 self-center">
                    OTP đã gửi đến: <span className="font-semibold">{pendingEmailChange}</span>
                  </span>
                )}
              </div>

              {pendingEmailChange && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
                  <div>
                    <label className="block font-medium mb-2 text-slate-700 dark:text-slate-300">Mã OTP</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Nhập mã 6 số"
                      className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <Button
                    onClick={handleVerifyEmailChange}
                    disabled={verifyingEmailOtp}
                    icon={verifyingEmailOtp ? <FiLoader className="animate-spin" /> : undefined}
                    size="md"
                  >
                    {verifyingEmailOtp ? 'Đang xác thực...' : 'Xác thực OTP'}
                  </Button>
                  <Button
                    onClick={handleResendEmailOtp}
                    disabled={resendingEmailOtp}
                    icon={resendingEmailOtp ? <FiLoader className="animate-spin" /> : undefined}
                    variant="ghost"
                    size="md"
                  >
                    {resendingEmailOtp ? 'Đang gửi...' : 'Gửi lại OTP'}
                  </Button>
                </div>
              )}
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
      </div>
    </div>
  );
}
