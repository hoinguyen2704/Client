import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiTruck, FiHeadphones, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { motion } from 'motion/react';
import { Trans, useTranslation } from 'react-i18next';
import { authService } from '@/apis';
import useAuthStore from '@/stores/useAuthStore';
import { Checkbox } from '@/components';
import { SHOP } from '@/constants/shopConstants';
import { getApiErrorCode, getApiErrorMessage } from '@/utils/error';
import { startGoogleLoginRedirect } from '@/utils/googleAuth';
import AuthLayout from './AuthLayout';

type LoginLocationState = { from?: string | { pathname?: string } };

function resolveFromPath(state: unknown): string {
  const from = (state as LoginLocationState | null)?.from;
  if (typeof from === 'string' && from.trim()) return from;
  if (from && typeof from === 'object' && typeof from.pathname === 'string' && from.pathname.trim()) {
    return from.pathname;
  }
  return '/';
}

function LoginForm() {
  const { t } = useTranslation(['auth', 'common']);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<'GOOGLE' | 'FACEBOOK' | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  const from = resolveFromPath(location.state);

  const completeLogin = (payload: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; fullName: string; email: string; role: string; avatarUrl?: string };
  }) => {
    const { accessToken, refreshToken, user } = payload;
    login(accessToken, refreshToken, {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
      avatar: user.avatarUrl,
    }, rememberMe);

    if (user.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  const resolveSocialErrorMessage = (err: unknown): string => {
    const code = getApiErrorCode(err);
    if (code === 'SOCIAL_NOT_LINKED') {
      return t('login.errors.socialNotLinked', { ns: 'auth' });
    }
    return getApiErrorMessage(err, translate, 'auth:login.errors.googleFailed');
  };

  useEffect(() => {
    const code = searchParams.get('google_error_code');
    const message = searchParams.get('google_error_message');
    if (!code && !message) return;

    setError(resolveSocialErrorMessage({
      response: {
        data: {
          errorCode: code || undefined,
          message: message || t('login.errors.googleFailed', { ns: 'auth' }),
        },
      },
    }));
  }, [searchParams, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ identifier, password });
      completeLogin(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, translate, 'auth:login.errors.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSocialLoadingProvider('GOOGLE');
    try {
      startGoogleLoginRedirect(from);
    } catch (err: unknown) {
      setError(resolveSocialErrorMessage(err));
      setSocialLoadingProvider(null);
    }
  };

  const handleFacebookLogin = () => {
    setError(t('login.errors.facebookUnsupported', { ns: 'auth' }));
  };

  return (
    <>
      <div className="text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
          {t('login.title', { ns: 'auth' })}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
          {t('login.subtitle', { ns: 'auth', shop: SHOP.name })}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-md sm:text-lg">
          <FiAlertCircle className="text-xl shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <form className="space-y-6 sm:space-y-8" onSubmit={handleLogin}>
        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
              {t('login.identifierLabel', { ns: 'auth' })}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FiUser className="text-slate-400 group-focus-within:text-blue-500 transition-colors text-xl sm:text-2xl" />
              </div>
              <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                placeholder={t('login.identifierPlaceholder', { ns: 'auth' })} />
            </div>
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
              {t('login.passwordLabel', { ns: 'auth' })}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FiLock className="text-slate-400 group-focus-within:text-blue-500 transition-colors text-xl sm:text-2xl" />
              </div>
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-14 sm:pl-16 pr-14 sm:pr-16 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                placeholder={t('login.passwordPlaceholder', { ns: 'auth' })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {showPassword ? <FiEyeOff className="text-xl sm:text-2xl" /> : <FiEye className="text-xl sm:text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <Checkbox
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked)}
              className="h-5 w-5"
            />
            <label htmlFor="remember-me" className="ml-3 block text-base sm:text-lg text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              {t('login.rememberMe', { ns: 'auth' })}
            </label>
          </div>
          <Link to="/forgot-password" className="text-base sm:text-lg font-medium text-blue-600 hover:text-blue-500 transition-colors">
            {t('login.forgotPassword', { ns: 'auth' })}
          </Link>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="group relative w-full flex justify-center items-center py-4 sm:py-5 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{t('login.submit', { ns: 'auth' })} <FiArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-1 transition-transform" /></>
          )}
        </motion.button>
      </form>

      {/* Social Login */}
      <div className="pt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-lg">
            <span className="px-5 bg-white dark:bg-slate-800 text-slate-500 rounded-full">
              {t('login.divider', { ns: 'auth' })}
            </span>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            disabled={loading || socialLoadingProvider !== null}
            className="w-full flex items-center justify-center gap-3 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {socialLoadingProvider === 'GOOGLE' ? <FiLoader className="text-2xl animate-spin" /> : <FcGoogle className="text-3xl" />}
            {socialLoadingProvider === 'GOOGLE'
              ? t('login.googleLoading', { ns: 'auth' })
              : 'Google'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleFacebookLogin}
            disabled={loading || socialLoadingProvider !== null}
            className="w-full flex items-center justify-center gap-3 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
            <FaFacebook className="text-3xl text-blue-600" /> Facebook
          </motion.button>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {t('login.registerPrompt', { ns: 'auth' })}{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            {t('login.registerLink', { ns: 'auth' })}
          </Link>
        </p>
      </div>
    </>
  );
}

export default function Login() {
  const { t } = useTranslation('auth');
  const features = [
    { icon: FiShield, title: t('features.security.title'), desc: t('features.security.desc') },
    { icon: FiTruck, title: t('features.shipping.title'), desc: t('features.shipping.desc') },
    { icon: FiHeadphones, title: t('features.support.title'), desc: t('features.support.desc') },
  ];

  return (
    <AuthLayout
      heroGradient="from-blue-700 via-blue-600 to-blue-600 dark:from-blue-950 dark:via-slate-900 dark:to-blue-950"
      accentBlobClass="bg-blue-400/10"
      heroTitle={(
        <Trans
          ns="auth"
          i18nKey="login.heroTitle"
          values={{ shop: SHOP.name }}
          components={{
            highlight: <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300" />,
          }}
        />
      )}
      heroSubtitle={t('login.heroSubtitle')}
      features={features}
      mobileLogoGradient="from-blue-600 to-blue-600"
      mobileLogoShadow="shadow-blue-500/30"
    >
      <LoginForm />
    </AuthLayout>
  );
}
