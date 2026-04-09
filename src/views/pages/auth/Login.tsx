import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiTruck, FiHeadphones, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { motion } from 'motion/react';
import { authService } from '@/apis';
import useAuthStore from '@/stores/useAuthStore';
import { SHOP } from '@/constants/shopConstants';
import { getApiErrorMessage } from '@/utils/error';
import AuthLayout from './AuthLayout';

const features = [
  { icon: FiShield, title: 'Bảo mật tuyệt đối', desc: 'Mã hóa SSL 256-bit bảo vệ mọi giao dịch' },
  { icon: FiTruck, title: 'Giao hàng siêu tốc', desc: 'Miễn phí giao hàng cho đơn từ 500K' },
  { icon: FiHeadphones, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn' },
];

const loginHeroTitle = (
  <>Chào mừng bạn đến với{' '}<span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">{SHOP.name}</span></>
);

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
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const from = resolveFromPath(location.state);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      const { accessToken, refreshToken, user } = res.data;

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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Email hoặc mật khẩu không đúng'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">Đăng nhập</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">Chào mừng bạn quay trở lại {SHOP.name}</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm sm:text-lg">
          <FiAlertCircle className="text-xl shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <form className="space-y-6 sm:space-y-8" onSubmit={handleLogin}>
        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">Email / Số điện thoại</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
              </div>
              <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Nhập email hoặc SĐT" />
            </div>
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
              </div>
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-14 sm:pl-16 pr-14 sm:pr-16 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Nhập mật khẩu" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {showPassword ? <FiEyeOff className="text-xl sm:text-2xl" /> : <FiEye className="text-xl sm:text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
              className="h-5 w-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer checked:bg-purple-600 checked:border-purple-600 relative
                after:content-[''] after:absolute after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-white after:border-r-[3px] after:border-b-[3px] after:rotate-45 after:opacity-0 checked:after:opacity-100 transition-all" />
            <label htmlFor="remember-me" className="ml-3 block text-base sm:text-lg text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Ghi nhớ đăng nhập
            </label>
          </div>
          <Link to="/forgot-password" className="text-base sm:text-lg font-medium text-purple-600 hover:text-purple-500 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="group relative w-full flex justify-center items-center py-4 sm:py-5 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Đăng nhập <FiArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-1 transition-transform" /></>
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
            <span className="px-5 bg-white dark:bg-slate-800 text-slate-500 rounded-full">Hoặc đăng nhập với</span>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <FcGoogle className="text-3xl" /> Google
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <FaFacebook className="text-3xl text-blue-600" /> Facebook
          </motion.button>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">Đăng ký ngay</Link>
        </p>
      </div>
    </>
  );
}

export default function Login() {
  return (
    <AuthLayout
      heroGradient="from-purple-700 via-purple-600 to-blue-600 dark:from-purple-950 dark:via-slate-900 dark:to-blue-950"
      accentBlobClass="bg-blue-400/10"
      heroTitle={loginHeroTitle}
      heroSubtitle="Nền tảng mua sắm công nghệ hàng đầu Việt Nam với hàng ngàn sản phẩm chính hãng."
      features={features}
      mobileLogoGradient="from-purple-600 to-blue-600"
      mobileLogoShadow="shadow-purple-500/30"
    >
      <LoginForm />
    </AuthLayout>
  );
}
