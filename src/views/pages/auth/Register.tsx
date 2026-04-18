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
      setPasswordStrength({ score: 1, label: t('register.passwordStrength.weak', { ns: 'auth', defaultValue: 'Yếu' }), color: 'bg-red-500' });
    } else if (score < 5) {
      setPasswordStrength({ score: 2, label: t('register.passwordStrength.medium', { ns: 'auth', defaultValue: 'Trung bình' }), color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score: 3, label: t('register.passwordStrength.strong', { ns: 'auth', defaultValue: 'Mạnh' }), color: 'bg-emerald-500' });
    }
  }, [password, t]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.errors.confirmMismatch', { ns: 'auth', defaultValue: 'Mật khẩu xác nhận không khớp' }));
      return;
    }

    if (password.length < 6) {
      setError(t('register.errors.passwordMin', { ns: 'auth', defaultValue: 'Mật khẩu phải có ít nhất 6 ký tự' }));
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
    { icon: FiShield, title: t('features.security.title', { ns: 'auth', defaultValue: 'Bảo mật tuyệt đối' }), desc: t('features.security.desc', { ns: 'auth', defaultValue: 'Mã hóa SSL 256-bit bảo vệ mọi giao dịch' }) },
    { icon: FiTruck, title: t('features.shipping.title', { ns: 'auth', defaultValue: 'Giao hàng siêu tốc' }), desc: t('features.shipping.desc', { ns: 'auth', defaultValue: 'Miễn phí giao hàng cho đơn từ 500K' }) },
    { icon: FiHeadphones, title: t('features.support.title', { ns: 'auth', defaultValue: 'Hỗ trợ 24/7' }), desc: t('features.support.desc', { ns: 'auth', defaultValue: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn' }) },
  ];

  return (
    <AuthLayout
      heroGradient="from-blue-700 via-purple-600 to-pink-600 dark:from-blue-950 dark:via-slate-900 dark:to-pink-950"
      accentBlobClass="bg-pink-400/10"
      heroTitle={(
        <Trans
          ns="auth"
          i18nKey="register.heroTitle"
          defaults="Tham gia cộng đồng <highlight>công nghệ</highlight>"
          components={{
            highlight: <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300" />,
          }}
        />
      )}
      heroSubtitle={t('register.heroSubtitle', {
        ns: 'auth',
        defaultValue: 'Đăng ký ngay để nhận ưu đãi độc quyền và trải nghiệm mua sắm tuyệt vời nhất.',
      })}
      features={features}
      mobileLogoGradient="from-blue-600 to-purple-600"
      mobileLogoShadow="shadow-blue-500/30"
    >
      <div className="text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
          {t('register.title', { ns: 'auth', defaultValue: 'Đăng ký tài khoản' })}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
          {t('register.subtitle', { ns: 'auth', defaultValue: 'Tạo tài khoản để trải nghiệm mua sắm tốt nhất' })}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-md sm:text-lg">
          <FiAlertCircle className="text-xl shrink-0" /><span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl text-md sm:text-lg">
          <FiCheckCircle className="text-xl shrink-0" /><span>{t('register.success', { ns: 'auth', defaultValue: 'Đăng ký thành công! Đang chuyển hướng...' })}</span>
        </motion.div>
      )}

      <form className="space-y-6 sm:space-y-8" onSubmit={handleRegister}>
        <div>
          <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
            {t('register.fullNameLabel', { ns: 'auth', defaultValue: 'Họ và tên' })}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <FiUser className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
            </div>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="block w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder={t('register.fullNamePlaceholder', { ns: 'auth', defaultValue: 'Nhập họ và tên' })} />
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
            {t('register.emailLabel', { ns: 'auth', defaultValue: 'Email' })}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
            </div>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder={t('register.emailPlaceholder', { ns: 'auth', defaultValue: 'Nhập địa chỉ email' })} />
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
            {t('register.phoneLabel', { ns: 'auth', defaultValue: 'Số điện thoại' })}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <FiPhone className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
            </div>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="block w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder={t('register.phonePlaceholder', { ns: 'auth', defaultValue: 'Nhập số điện thoại (không bắt buộc)' })} />
          </div>
        </div>

        <div>
          <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
            {t('register.passwordLabel', { ns: 'auth', defaultValue: 'Mật khẩu' })}
          </label>
          <div className="relative group mb-4">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
            </div>
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-14 sm:pl-16 pr-14 sm:pr-16 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder={t('register.passwordPlaceholder', { ns: 'auth', defaultValue: 'Tạo mật khẩu' })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-purple-600 transition-colors">
              {showPassword ? <FiEyeOff className="text-xl sm:text-2xl" /> : <FiEye className="text-xl sm:text-2xl" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-3 mt-4 px-2">
              <div className="flex-1 flex gap-2 h-2.5">
                <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
              </div>
              <span className={`text-md font-semibold uppercase tracking-wider ${passwordStrength.score === 1 ? 'text-red-500' : passwordStrength.score === 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
            {t('register.confirmPasswordLabel', { ns: 'auth', defaultValue: 'Xác nhận mật khẩu' })}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
            </div>
            <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-14 sm:pl-16 pr-14 sm:pr-16 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder={t('register.confirmPasswordPlaceholder', { ns: 'auth', defaultValue: 'Nhập lại mật khẩu' })} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-purple-600 transition-colors">
              {showConfirmPassword ? <FiEyeOff className="text-xl sm:text-2xl" /> : <FiEye className="text-xl sm:text-2xl" />}
            </button>
          </div>
        </div>

        <div className="flex items-start pt-3">
          <span className="mt-1 shrink-0">
            <Checkbox id="terms" name="terms" required className="h-5 w-5" />
          </span>
          <label htmlFor="terms" className="ml-4 block text-base sm:text-lg text-slate-600 dark:text-slate-400 cursor-pointer">
            <Trans
              ns="auth"
              i18nKey="register.terms"
              defaults="Tôi đồng ý với <termsLink>Điều khoản dịch vụ</termsLink> và <privacyLink>Chính sách bảo mật</privacyLink>"
              components={{
                termsLink: <Link to="/terms" className="text-purple-600 hover:text-purple-500 font-semibold" />,
                privacyLink: <Link to="/privacy" className="text-purple-600 hover:text-purple-500 font-semibold" />,
              }}
            />
          </label>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="group relative w-full flex justify-center items-center py-4 sm:py-5 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{t('register.submit', { ns: 'auth', defaultValue: 'Đăng ký' })} <FiArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-1 transition-transform" /></>
          )}
        </motion.button>
      </form>

      <div className="text-center pt-4">
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          {t('register.loginPrompt', { ns: 'auth', defaultValue: 'Đã có tài khoản?' })}{' '}
          <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
            {t('register.loginLink', { ns: 'auth', defaultValue: 'Đăng nhập ngay' })}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
