import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle, FiCamera, FiLock, FiLoader, FiSave, FiUser, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '@/utils/error';
import userService from '@/apis/services/userService';
import useAuthStore from '@/stores/useAuthStore';
import { Button, CustomSelect } from '@/components';
import type { UserResponse } from '@/types';

export default function Profile() {
  const { t } = useTranslation('account');
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneHintMinimized, setIsPhoneHintMinimized] = useState(false);

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
      setPhoneNumber(u.phoneNumber || '');
    } catch {
      toast.error(t('profile.toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error(t('profile.toasts.fullNameRequired'));
      return;
    }

    if (!hasPersistedPhoneNumber) {
      const compactPhoneNumber = phoneNumber.trim().replaceAll(/[\s().-]/g, '');
      if (compactPhoneNumber && !/^(0|\+84|84)[35789][0-9]{8}$/.test(compactPhoneNumber)) {
        toast.error(t('profile.toasts.phoneInvalid'));
        return;
      }
    }

    setSaving(true);
    try {
      const res = await userService.updateProfile({
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        phoneNumber: !hasPersistedPhoneNumber && phoneNumber.trim() ? phoneNumber.trim() : undefined,
      });
      setUser(res.data);
      setPhoneNumber(res.data.phoneNumber || '');
      toast.success(t('profile.toasts.profileUpdated'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'profile.toasts.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error(t('profile.toasts.passwordRequired'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('profile.toasts.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.toasts.passwordMismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success(t('profile.toasts.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'profile.toasts.passwordUpdateFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRequestEmailChange = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error(t('profile.toasts.newEmailRequired'));
      return;
    }
    if (!emailChangePassword) {
      toast.error(t('profile.toasts.currentPasswordRequired'));
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
      toast.success(t('profile.toasts.emailOtpSent'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'profile.toasts.emailOtpSendFailed'));
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (!pendingEmailChange) return;
    setResendingEmailOtp(true);
    try {
      await userService.resendEmailChangeOtp({ newEmail: pendingEmailChange });
      toast.success(t('profile.toasts.emailOtpResent'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'profile.toasts.emailOtpResendFailed'));
    } finally {
      setResendingEmailOtp(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!pendingEmailChange) return;
    if (!otpCode.trim()) {
      toast.error(t('profile.toasts.otpRequired'));
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
      toast.success(t('profile.toasts.emailUpdated'));
      setTimeout(() => {
        useAuthStore.getState().logout();
      }, 1000);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'profile.toasts.emailVerifyFailed'));
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
      toast.success(t('profile.toasts.avatarUpdated'));
    } catch {
      toast.error(t('profile.toasts.avatarUploadFailed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-blue-500 animate-spin" />
          <span className="text-muted font-medium">{t('profile.loading.profile')}</span>
        </div>
      </div>
    );
  }

  const hasPersistedPhoneNumber = Boolean(user?.phoneNumber?.trim());
  const showPhoneHintPopup = !hasPersistedPhoneNumber && !isPhoneHintMinimized;
  const showPhoneHintPill = !hasPersistedPhoneNumber && isPhoneHintMinimized;
  const displayPhoneNumber = hasPersistedPhoneNumber ? (user?.phoneNumber || '') : phoneNumber;

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showPhoneHintPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 left-4 right-4 z-40 sm:left-auto sm:right-6 sm:w-[360px]"
          >
            <div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-white/95 shadow-[0_18px_45px_-20px_rgba(180,83,9,0.45)] backdrop-blur">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <FiAlertCircle className="text-lg" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-sm font-semibold text-ink">{t('profile.phoneHint.title')}</p>
                    <p className="text-sm leading-6 text-muted">
                      {t('profile.phoneHint.description')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhoneHintMinimized(true)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-slate-100 hover:text-body"
                    aria-label={t('profile.phoneHint.minimizeAria')}
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPhoneHintPill && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setIsPhoneHintMinimized(false)}
            className="fixed bottom-6 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/95 px-4 py-3 text-sm font-semibold text-amber-800 shadow-[0_16px_35px_-22px_rgba(180,83,9,0.5)] backdrop-blur transition-transform hover:-translate-y-0.5 sm:left-auto sm:right-6"
          >
            <FiAlertCircle className="text-base" />
            {t('profile.phoneHint.pill')}
          </motion.button>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.92fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_32%)]">
            <div className="grid gap-6 p-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:p-8">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg group dark:border-slate-900 dark:bg-slate-800">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={t('profile.avatar.alt')}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Hide broken image tag, show fallback
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-900/20 ${user?.avatarUrl ? 'hidden' : ''}`}>
                      <FiUser className="text-5xl text-blue-500 dark:text-blue-400" />
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-full bg-black/60 text-white">
                        <FiLoader className="mb-1 text-3xl animate-spin" />
                        <span className="text-10 font-medium">{t('profile.loading.avatar')}</span>
                      </div>
                    )}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity ${uploadingAvatar ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100'}`}
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

                  <div className="space-y-1">
                    <p className="text-xl font-bold text-ink">
                      {fullName.trim() || user?.fullName || user?.email || ''}
                    </p>
                    <p className="break-all text-sm text-muted">{user?.email || ''}</p>
                  </div>

                  <Button
                    onClick={() => avatarInputRef.current?.click()}
                    variant="ghost"
                    size="sm"
                    className="text-md text-blue-600 hover:underline"
                  >
                    {t('profile.avatar.change')}
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-medium text-body">{t('profile.fields.fullName')}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 w-full rounded-xl border-none bg-slate-100 px-4 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-body">{t('profile.fields.emailReadonly')}</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="h-12 w-full cursor-not-allowed rounded-xl border-none bg-slate-50 px-4 text-muted dark:bg-slate-800/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-body">{t('profile.fields.phoneNumber')}</label>
                    <input
                      type="tel"
                      value={displayPhoneNumber}
                      onChange={(e) => {
                        if (!hasPersistedPhoneNumber) {
                          setPhoneNumber(e.target.value);
                        }
                      }}
                      placeholder={hasPersistedPhoneNumber ? '' : t('profile.fields.phonePlaceholder')}
                      readOnly={hasPersistedPhoneNumber}
                      className={`h-12 w-full rounded-xl border-none px-4 ${
                        hasPersistedPhoneNumber
                          ? 'cursor-not-allowed bg-slate-50 text-muted dark:bg-slate-800/50'
                          : 'bg-slate-100 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800'
                      }`}
                    />
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {hasPersistedPhoneNumber
                        ? t('profile.fields.phoneReadonlyHint')
                        : t('profile.fields.phoneFormatHint')}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-body">{t('profile.fields.dateOfBirth')}</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-12 w-full rounded-xl border-none bg-slate-100 px-4 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block font-medium text-body">{t('profile.fields.gender')}</label>
                    <CustomSelect
                      value={gender}
                      onChange={(v) => setGender(v)}
                      className="h-12 w-full"
                      options={[
                        { value: '', label: t('profile.genderOptions.unset') },
                        { value: 'MALE', label: t('profile.genderOptions.male') },
                        { value: 'FEMALE', label: t('profile.genderOptions.female') },
                        { value: 'OTHER', label: t('profile.genderOptions.other') }
                      ]}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    icon={saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                    size="lg"
                    className="h-12 px-6"
                  >
                    {saving ? t('profile.actions.savingChanges') : t('profile.actions.saveChanges')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-ink">{t('profile.emailOtp.title')}</h3>
                <p className="mt-1 text-md leading-6 text-muted">
                  {t('profile.emailOtp.description')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-body">{t('profile.emailOtp.newEmail')}</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-body">{t('profile.emailOtp.currentPassword')}</label>
                  <input
                    type="password"
                    value={emailChangePassword}
                    onChange={(e) => setEmailChangePassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <Button
                onClick={handleRequestEmailChange}
                disabled={sendingEmailOtp}
                icon={sendingEmailOtp ? <FiLoader className="animate-spin" /> : undefined}
                size="md"
                fullWidth
              >
                {sendingEmailOtp ? t('profile.emailOtp.sendingOtp') : t('profile.emailOtp.sendOtp')}
              </Button>

              {pendingEmailChange && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                  {t('profile.emailOtp.otpSentTo')} <span className="font-semibold">{pendingEmailChange}</span>
                </div>
              )}

              {pendingEmailChange && (
                <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div>
                    <label className="mb-2 block font-medium text-body">{t('profile.emailOtp.otpCode')}</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder={t('profile.emailOtp.otpPlaceholder')}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                      onClick={handleVerifyEmailChange}
                      disabled={verifyingEmailOtp}
                      icon={verifyingEmailOtp ? <FiLoader className="animate-spin" /> : undefined}
                      size="md"
                      fullWidth
                    >
                      {verifyingEmailOtp ? t('profile.emailOtp.verifyingOtp') : t('profile.emailOtp.verifyOtp')}
                    </Button>
                    <Button
                      onClick={handleResendEmailOtp}
                      disabled={resendingEmailOtp}
                      icon={resendingEmailOtp ? <FiLoader className="animate-spin" /> : undefined}
                      variant="ghost"
                      size="md"
                      fullWidth
                    >
                      {resendingEmailOtp ? t('profile.emailOtp.resendingOtp') : t('profile.emailOtp.resendOtp')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xl text-orange-600">
                <FiLock />
              </div>
              <h2 className="text-xl font-bold">{t('profile.passwordSection.title')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-medium text-body">{t('profile.passwordSection.currentPassword')}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border-none bg-slate-100 px-4 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-body">{t('profile.passwordSection.newPassword')}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border-none bg-slate-100 px-4 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-body">{t('profile.passwordSection.confirmPassword')}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border-none bg-slate-100 px-4 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={savingPassword}
                icon={savingPassword ? <FiLoader className="animate-spin" /> : undefined}
                variant="secondary"
                size="md"
                fullWidth
                className="mt-4 bg-slate-900 text-white hover:bg-blue-600 dark:bg-slate-700 dark:hover:bg-blue-600"
              >
                {savingPassword ? t('profile.passwordSection.submitting') : t('profile.passwordSection.submit')}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
