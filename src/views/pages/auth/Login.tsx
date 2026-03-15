import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import LogoIcon from '@/components/ui/LogoIcon';
import { motion } from 'motion/react';

const features = [
  { icon: FiShield, title: 'Bảo mật tuyệt đối', desc: 'Mã hóa SSL 256-bit bảo vệ mọi giao dịch' },
  { icon: FiTruck, title: 'Giao hàng siêu tốc', desc: 'Miễn phí giao hàng cho đơn từ 500K' },
  { icon: FiHeadphones, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn' },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Hero Panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 dark:from-purple-950 dark:via-slate-900 dark:to-blue-950 text-white flex-col p-16 xl:p-24">
        {/* Decorative circles */}
        <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-purple-400/10 rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="relative z-10 mb-auto">
          <Link to="/" className="inline-flex items-center gap-4 hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <LogoIcon className="w-8 h-8" />
            </div>
            <span className="text-3xl font-bold">Hozitech</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-[680px] mx-auto my-auto w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl xl:text-7xl font-bold leading-tight mb-8"
          >
            Chào mừng bạn đến với{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
              Hozitech
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-white/80 mb-14 leading-relaxed"
          >
            Nền tảng mua sắm công nghệ hàng đầu Việt Nam với hàng ngàn sản phẩm chính hãng.
          </motion.p>

          {/* Features */}
          <div className="space-y-10">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <f.icon className="text-4xl" />
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-2xl">{f.title}</h3>
                  <p className="text-white/70 text-lg mt-2">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto"></div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8 sm:p-12 lg:p-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[680px] bg-white dark:bg-slate-800 p-10 sm:p-16 lg:p-20 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700/50 space-y-10"
      >
          {/* Mobile Logo */}
          <div className="text-center lg:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-3 justify-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <LogoIcon className="w-10 h-10" />
              </div>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Đăng nhập
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Chào mừng bạn quay trở lại Hozitech
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">
                  Email / Số điện thoại
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-16 pr-6 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Nhập email hoặc SĐT"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-16 pr-16 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="text-2xl" /> : <FiEye className="text-2xl" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-6 w-6 text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900/50 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-lg text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link to="/forgot-password" className="text-lg font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="group relative w-full flex justify-center items-center py-5 px-8 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 mt-6"
            >
              Đăng nhập
              <FiArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          {/* Social Login */}
          <div className="pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-lg">
                <span className="px-5 bg-white dark:bg-slate-800 text-slate-500 rounded-full">Hoặc đăng nhập với</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-5">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-3 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <FcGoogle className="text-3xl" /> Google
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-3 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <FaFacebook className="text-3xl text-blue-600" /> Facebook
              </motion.button>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-slate-700/80">
            <p className="text-base text-slate-500 text-center mb-6 uppercase tracking-wider font-semibold">Tài khoản dùng thử</p>
            <div className="grid grid-cols-2 gap-5">
              <button onClick={loginAsUser}
                className="flex flex-col items-center justify-center p-5 border border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <span className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Khách hàng</span>
                <span className="text-base text-slate-500">user@hozitech.com</span>
              </button>
              <button onClick={loginAsAdmin}
                className="flex flex-col items-center justify-center p-5 border border-purple-200 dark:border-purple-800/50 rounded-2xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all shadow-sm"
              >
                <span className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-1">Quản trị viên</span>
                <span className="text-base text-purple-500">admin@hozitech.com</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
