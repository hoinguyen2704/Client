import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowRight, FiShield, FiTruck, FiHeadphones, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'motion/react';
import { Trans, useTranslation } from 'react-i18next';
import { authService } from '@/apis';
import { Checkbox } from '@/components';
import useAuthStore from '@/stores/useAuthStore';
import { getApiErrorMessage } from '@/utils/error';
import AuthLayout from './AuthLayout';

export default function Register() {
  const { t } = useTranslation(['auth', 'common']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length === 0) {
      setPasswordStrength({ score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' });
    } else if (score < 3) {
      setPasswordStrength({ score: 1, label: t('register.passwordStrength.weak', { ns: 'auth' }), color: 'bg-red-500' });
    } else if (score < 5) {
      setPasswordStrength({ score: 2, label: t('register.passwordStrength.medium', { ns: 'auth' }), color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score: 3, label: t('register.passwordStrength.strong', { ns: 'auth' }), color: 'bg-emerald-500' });
    }
  }, [password, t]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.errors.confirmMismatch', { ns: 'auth' }));
      return;
    }

    if (password.length < 6) {
      setError(t('register.errors.passwordMin', { ns: 'auth' }));
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        fullName,
        userName: email.split('@')[0],
        email,
        password,
        phoneNumber: phone || undefined,
      });

      const { accessToken, refreshToken, user } = res.data;
      login(accessToken, refreshToken, {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
        avatar: user.avatarUrl,
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, translate, 'auth:register.errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FiShield, title: t('features.security.title', { ns: 'auth' }), desc: t('features.security.desc', { ns: 'auth' }) },
    { icon: FiTruck, title: t('features.shipping.title', { ns: 'auth' }), desc: t('features.shipping.desc', { ns: 'auth' }) },
    { icon: FiHeadphones, title: t('features.support.title', { ns: 'auth' }), desc: t('features.support.desc', { ns: 'auth' }) },
  ];

  const labelClassName = 'block text-sm sm:text-base font-medium text-body mb-2 ml-1';
  const iconClassName = 'text-subtle group-focus-within:text-blue-500 transition-colors text-lg sm:text-xl';
  const inputClassName =
    'block w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3.5 sm:py-4 text-base sm:text-lg border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-ink focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm';

  return (
    <AuthLayout
      heroGradient="from-blue-700 via-blue-600 to-pink-600 dark:from-blue-950 dark:via-slate-900 dark:to-pink-950"
      accentBlobClass="bg-pink-400/10"
      heroTitle={(
        <Trans
          ns="auth"
          i18nKey="register.heroTitle"
          components={{
            highlight: <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300" />,
          }}
        />
      )}
      heroSubtitle={t('register.heroSubtitle', { ns: 'auth' })}
      features={features}
      mobileLogoGradient="from-blue-600 to-blue-600"
      mobileLogoShadow="shadow-blue-500/30"
      formPanelClassName="lg:max-w-[640px] sm:p-8 lg:p-10 gap-5 sm:gap-6"
    >
      <div className="text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-bold text-ink mb-2 sm:mb-3 tracking-tight">
          {t('register.title', { ns: 'auth' })}
        </h2>
        <p className="text-muted text-sm sm:text-base">
          {t('register.subtitle', { ns: 'auth' })}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm sm:text-base">
          <FiAlertCircle className="text-xl shrink-0" /><span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm sm:text-base">
          <FiCheckCircle className="text-xl shrink-0" /><span>{t('register.success', { ns: 'auth' })}</span>
        </motion.div>
      )}

      <form className="space-y-5 sm:space-y-6" onSubmit={handleRegister}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className={labelClassName}>
              {t('register.fullNameLabel', { ns: 'auth' })}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiUser className={iconClassName} />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClassName}
                placeholder={t('register.fullNamePlaceholder', { ns: 'auth' })}
              />
            </div>
          </div>

          <div>
            <label className={labelClassName}>
              {t('register.phoneLabel', { ns: 'auth' })}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiPhone className={iconClassName} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
                placeholder={t('register.phonePlaceholder', { ns: 'auth' })}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className={labelClassName}>
              {t('register.emailLabel', { ns: 'auth' })}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiMail className={iconClassName} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder={t('register.emailPlaceholder', { ns: 'auth' })}
              />
            </div>
          </div>

          <div>
            <label className={labelClassName}>
              {t('register.passwordLabel', { ns: 'auth' })}
            </label>
            <div className="relative group mb-3">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiLock className={iconClassName} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClassName} pr-12 sm:pr-14`}
                placeholder={t('register.passwordPlaceholder', { ns: 'auth' })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-subtle hover:text-blue-600 transition-colors">
                {showPassword ? <FiEyeOff className="text-lg sm:text-xl" /> : <FiEye className="text-lg sm:text-xl" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 flex gap-1.5 h-2">
                  <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${passwordStrength.score === 1 ? 'text-red-500' : passwordStrength.score === 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className={labelClassName}>
              {t('register.confirmPasswordLabel', { ns: 'auth' })}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FiLock className={iconClassName} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClassName} pr-12 sm:pr-14`}
                placeholder={t('register.confirmPasswordPlaceholder', { ns: 'auth' })}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-subtle hover:text-blue-600 transition-colors">
                {showConfirmPassword ? <FiEyeOff className="text-lg sm:text-xl" /> : <FiEye className="text-lg sm:text-xl" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start pt-1">
          <span className="mt-1 shrink-0">
            <Checkbox id="terms" name="terms" required className="h-5 w-5" />
          </span>
          <label htmlFor="terms" className="ml-3 block text-sm sm:text-base text-muted cursor-pointer leading-relaxed">
            <Trans
              ns="auth"
              i18nKey="register.terms"
              components={{
                termsLink: <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-semibold" />,
                privacyLink: <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-semibold" />,
              }}
            />
          </label>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="group relative w-full flex justify-center items-center py-3.5 sm:py-4 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{t('register.submit', { ns: 'auth' })} <FiArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" /></>
          )}
        </motion.button>

        <div className="text-center pt-1">
          <p className="text-sm sm:text-base text-muted">
            {t('register.loginPrompt', { ns: 'auth' })}{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              {t('register.loginLink', { ns: 'auth' })}
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
