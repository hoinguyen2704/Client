import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import LogoIcon from '@/components/ui/LogoIcon';
import { motion } from 'motion/react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login logic
    if (email === 'admin@hozitech.com') {
      localStorage.setItem('user', JSON.stringify({ role: 'admin', email }));
      navigate('/admin');
    } else {
      localStorage.setItem('user', JSON.stringify({ role: 'user', email }));
      navigate('/user');
    }
  };

  const loginAsAdmin = () => {
    setEmail('admin@hozitech.com');
    setPassword('admin123');
    localStorage.setItem('user', JSON.stringify({ role: 'admin', email: 'admin@hozitech.com' }));
    setTimeout(() => navigate('/admin'), 500);
  };

  const loginAsUser = () => {
    setEmail('user@hozitech.com');
    setPassword('user123');
    localStorage.setItem('user', JSON.stringify({ role: 'user', email: 'user@hozitech.com' }));
    setTimeout(() => navigate('/user'), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] right-[20%] w-[40rem] h-[40rem] bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[440px] w-full space-y-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 relative z-10"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 justify-center mb-6 hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-500/30">
              <LogoIcon className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Đăng nhập
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Chào mừng bạn quay trở lại Hozitech
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                Email / Số điện thoại
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-lg" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Nhập email hoặc SĐT"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary w-full py-3.5 group"
            >
              Đăng nhập
              <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/70 dark:bg-slate-800/70 text-slate-500 rounded-full">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <FcGoogle className="text-xl" />
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <FaFacebook className="text-xl text-blue-600" />
              Facebook
            </motion.button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4 uppercase tracking-wider font-semibold">
            Tài khoản dùng thử
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={loginAsUser}
              className="flex flex-col items-center justify-center p-3 border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Khách hàng</span>
              <span className="text-[11px] text-slate-500">user@hozitech.com</span>
            </button>
            <button
              onClick={loginAsAdmin}
              className="flex flex-col items-center justify-center p-3 border border-purple-200/80 dark:border-purple-800/50 rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-all shadow-sm"
            >
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-0.5">Quản trị viên</span>
              <span className="text-[11px] text-purple-500">admin@hozitech.com</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

