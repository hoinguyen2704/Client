import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import LogoIcon from '@/components/ui/LogoIcon';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate password reset logic
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
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
            Quên mật khẩu?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Đừng lo lắng, hãy nhập email hoặc số điện thoại của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn btn-primary w-full py-3.5 group"
              >
                Gửi mã xác nhận
                <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <FiCheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Đã gửi mã xác nhận!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. Vui lòng kiểm tra hộp thư hoặc tin nhắn của bạn.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-sm font-semibold text-purple-600 hover:text-purple-500 transition-colors"
            >
              Thử lại với tài khoản khác
            </button>
          </motion.div>
        )}

        <div className="text-center mt-8">
          <Link to="/login" className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang đăng nhập
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
