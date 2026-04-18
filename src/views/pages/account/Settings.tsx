import { useEffect, useState } from 'react';
import { FiBell, FiLock, FiSmartphone, FiMail, FiShield, FiKey, FiAlertTriangle, FiSun, FiGlobe, FiLoader } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';
import { Button, SwitchToggle, CustomSelect, Modal, ModalCancelButton, ModalSubmitButton } from '@/components';
import useUIStore from '@/stores/useUIStore';
import useAuthStore from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiErrorCode, getApiErrorMessage } from '@/utils/error';
import userService from '@/apis/services/userService';
import { requestGoogleIdToken } from '@/utils/googleAuth';
import type { LinkedSocialAccountResponse } from '@/types';
import type { SupportedLanguage } from '@/locales/config';

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
  const [socialAccounts, setSocialAccounts] = useState<LinkedSocialAccountResponse[]>([]);
  const [loadingSocialAccounts, setLoadingSocialAccounts] = useState(true);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [unlinkGoogleModalOpen, setUnlinkGoogleModalOpen] = useState(false);
  const [unlinkPassword, setUnlinkPassword] = useState('');
  const [unlinkingGoogle, setUnlinkingGoogle] = useState(false);
  const user = useAuthStore(s => s.user);
  const { darkMode, toggleDarkMode, language, setLanguage } = useUIStore();
  const { t } = useTranslation(['settings', 'common']);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    setLoadingSocialAccounts(true);
    try {
      const res = await userService.getSocialAccounts();
      setSocialAccounts(res.data ?? []);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'settings:toasts.socialLoadFailed'));
      setSocialAccounts([]);
    } finally {
      setLoadingSocialAccounts(false);
    }
  };

  const googleSocialAccount = socialAccounts.find((x) => x.provider === 'GOOGLE');
  const isGoogleLinked = Boolean(googleSocialAccount?.linked);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error(t('settings:toasts.passwordRequired'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('settings:toasts.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('settings:toasts.passwordMismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success(t('settings:toasts.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'settings:toasts.passwordUpdateFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (linkingGoogle) return;
    setLinkingGoogle(true);
    try {
      const token = await requestGoogleIdToken();
      await userService.linkSocialAccount({ provider: 'GOOGLE', token });
      await fetchSocialAccounts();
      toast.success(t('settings:toasts.googleLinked'));
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 'GOOGLE_EMAIL_MISMATCH') {
        toast.error(t('settings:socialAccounts.googleMismatch'));
        return;
      }
      if (code === 'SOCIAL_ACCOUNT_ALREADY_LINKED') {
        toast.error(t('settings:socialAccounts.googleAlreadyLinked'));
        return;
      }
      toast.error(getApiErrorMessage(err, t, 'settings:toasts.googleLinkFailed'));
    } finally {
      setLinkingGoogle(false);
    }
  };

  const openUnlinkGoogleModal = () => {
    setUnlinkPassword('');
    setUnlinkGoogleModalOpen(true);
  };

  const closeUnlinkGoogleModal = () => {
    if (unlinkingGoogle) return;
    setUnlinkGoogleModalOpen(false);
    setUnlinkPassword('');
  };

  const handleConfirmUnlinkGoogle = async () => {
    if (unlinkingGoogle) return;
    if (!unlinkPassword.trim()) {
      toast.error(t('settings:toasts.unlinkPasswordRequired'));
      return;
    }
    setUnlinkingGoogle(true);
    try {
      await userService.unlinkGoogleSocialAccount({ currentPassword: unlinkPassword });
      await fetchSocialAccounts();
      setUnlinkGoogleModalOpen(false);
      setUnlinkPassword('');
      toast.success(t('settings:toasts.googleUnlinked'));
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === 'UNLINK_LAST_LOGIN_METHOD') {
        toast.error(t('settings:toasts.unlinkLastLoginMethod'));
        return;
      }
      toast.error(getApiErrorMessage(err, t, 'settings:toasts.googleUnlinkFailed'));
    } finally {
      setUnlinkingGoogle(false);
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
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-body-soft transition-colors">
                    <FiSun className="text-lg" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('displayOptions.darkMode')}</p>
                </div>
                <SwitchToggle
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  tone="slate"
                  ariaLabel={t('settings:aria.toggleDarkMode')}
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
                    onChange={(v) => setLanguage(v as SupportedLanguage)}
                    options={[
                      { value: 'vi', label: t('settings:displayOptions.languageOptions.vi'), colorClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200" },
                      { value: 'en', label: t('settings:displayOptions.languageOptions.en'), colorClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200" }
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
                  ariaLabel={t('settings:aria.togglePromotions')}
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
              {t('settings:notifications.title')}
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{t('settings:notifications.channels')}</h3>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                      <FiMail />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t('settings:notifications.emailTitle')}</p>
                      <p className="text-md text-slate-500">{t('settings:notifications.emailDesc')}</p>
                    </div>
                  </div>
                  <SwitchToggle
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    tone="blue"
                    ariaLabel={t('settings:aria.toggleEmail')}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                      <FiSmartphone />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t('settings:notifications.smsTitle')}</p>
                      <p className="text-md text-slate-500">{t('settings:notifications.smsDesc')}</p>
                    </div>
                  </div>
                  <SwitchToggle
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                    tone="blue"
                    ariaLabel={t('settings:aria.toggleSms')}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                      <FiBell />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t('settings:notifications.appTitle')}</p>
                      <p className="text-md text-slate-500">{t('settings:notifications.appDesc')}</p>
                    </div>
                  </div>
                  <SwitchToggle
                    checked={notifications.app}
                    onChange={() => handleNotificationChange('app')}
                    tone="blue"
                    ariaLabel={t('settings:aria.toggleApp')}
                  />
                </label>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{t('settings:notifications.types')}</h3>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{t('settings:notifications.ordersTitle')}</p>
                    <p className="text-md text-slate-500">{t('settings:notifications.ordersDesc')}</p>
                  </div>
                  <SwitchToggle
                    checked={notifications.orders}
                    onChange={() => handleNotificationChange('orders')}
                    tone="blue"
                    ariaLabel={t('settings:aria.toggleOrders')}
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
              {t('settings:security.title')}
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
                      <p className="font-medium text-slate-900 dark:text-white">{t('settings:security.password.title')}</p>
                      <p className="text-md text-slate-500">{t('settings:security.password.lastUpdated')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    variant="outline"
                    size="sm"
                    className="px-4 border border-slate-200 dark:border-slate-700"
                  >
                    {isChangingPassword ? t('settings:security.password.buttonCancel') : t('settings:security.password.buttonChange')}
                  </Button>
                </div>

                {isChangingPassword && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <label className="block text-md font-medium text-body mb-1">{t('settings:security.password.current')}</label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-md font-medium text-body mb-1">{t('settings:security.password.new')}</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-md font-medium text-body mb-1">{t('settings:security.password.confirm')}</label>
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
                      {savingPassword ? t('settings:security.password.saving') : t('settings:security.password.save')}
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
                    <p className="font-medium text-slate-900 dark:text-white">{t('settings:security.twoFactor.title')}</p>
                    <p className="text-md text-slate-500">{t('settings:security.twoFactor.desc')}</p>
                  </div>
                </div>
                <SwitchToggle
                  checked={twoFactor}
                  onChange={setTwoFactor}
                  tone="success"
                  ariaLabel={t('settings:aria.toggleTwoFactor')}
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
                      <p className="text-md text-muted-strong mb-4">{t('settings:security.twoFactor.setupDescription')}</p>
                      <div className="flex gap-2 w-full">
                        <input type="text" placeholder={t('settings:security.twoFactor.otpPlaceholder')} className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono" maxLength={6} />
                        <Button variant="success" size="sm" className="px-4 bg-blue-600 hover:bg-blue-700 text-white border-0">{t('settings:security.twoFactor.confirm')}</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Social Accounts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{t('settings:socialAccounts.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-sm">
                    <FaGoogle />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Google</p>
                    {loadingSocialAccounts ? (
                      <p className="text-md text-slate-500">{t('settings:socialAccounts.loading')}</p>
                    ) : isGoogleLinked ? (
                      <p className="text-md text-slate-500">
                        {googleSocialAccount?.email
                          ? t('settings:socialAccounts.linkedWithEmail', { email: googleSocialAccount.email })
                          : t('settings:socialAccounts.linked')}
                      </p>
                    ) : (
                      <p className="text-md text-slate-500">{t('settings:socialAccounts.notLinked')}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loadingSocialAccounts || linkingGoogle || unlinkingGoogle}
                  onClick={isGoogleLinked ? openUnlinkGoogleModal : handleLinkGoogle}
                  icon={linkingGoogle ? <FiLoader className="animate-spin" /> : undefined}
                  className={`text-md ${isGoogleLinked ? 'text-slate-500 hover:text-red-500' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  {linkingGoogle ? t('settings:socialAccounts.linking') : isGoogleLinked ? t('settings:socialAccounts.unlink') : t('settings:socialAccounts.linkNow')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-blue-600 shadow-sm">
                    <FaFacebook />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Facebook</p>
                    <p className="text-md text-slate-500">{t('settings:socialAccounts.facebookComingSoon')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-md text-slate-400 cursor-not-allowed"
                >
                  {t('settings:socialAccounts.unsupported')}
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
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-1">{t('settings:deleteAccount.title')}</h3>
                <p className="text-md text-red-500/80 dark:text-red-400/80 mb-4">
                  {t('settings:deleteAccount.warning')}
                </p>
                <Button variant="danger" size="sm" className="px-4 text-md">
                  {t('settings:deleteAccount.button')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={unlinkGoogleModalOpen}
        onClose={closeUnlinkGoogleModal}
        title={t('settings:unlinkGoogleModal.title')}
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={closeUnlinkGoogleModal}>{t('common:actions.cancel')}</ModalCancelButton>
            <ModalSubmitButton
              onClick={handleConfirmUnlinkGoogle}
              variant="danger"
              icon={unlinkingGoogle ? <FiLoader className="animate-spin" /> : undefined}
            >
              {unlinkingGoogle ? t('settings:unlinkGoogleModal.submitting') : t('settings:unlinkGoogleModal.confirm')}
            </ModalSubmitButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-md text-muted-strong">
            {t('settings:unlinkGoogleModal.description')}
          </p>
          <div>
            <label className="block text-md font-medium text-body mb-1">
              {t('settings:unlinkGoogleModal.currentPassword')}
            </label>
            <input
              type="password"
              value={unlinkPassword}
              onChange={(e) => setUnlinkPassword(e.target.value)}
              placeholder="••••••••"
              disabled={unlinkingGoogle}
              className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
