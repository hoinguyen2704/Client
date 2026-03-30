import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiArrowRight, FiCheckCircle, FiShield, FiLock, FiKey } from 'react-icons/fi';
import LogoIcon from '@/components/ui/LogoIcon';
import { motion } from 'motion/react';
import { SHOP } from '@/constants/shopConstants';

const tips = [
  { icon: FiShield, title: 'Kiểm tra email spam', desc: 'Đôi khi email khôi phục có thể rơi vào thư mục spam' },
  { icon: FiLock, title: 'Tạo mật khẩu mạnh', desc: 'Kết hợp chữ hoa, số và ký tự đặc biệt' },
  { icon: FiKey, title: 'Không chia sẻ mật khẩu', desc: 'Giữ thông tin đăng nhập an toàn và riêng tư' },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="relative w-full max-w-[1400px]">
        {/* Left Hero Panel — absolute so form card determines height */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[calc(50%-8px)] bg-gradient-to-br from-emerald-700 via-teal-600 to-blue-600 dark:from-emerald-950 dark:via-slate-900 dark:to-blue-950 text-white rounded-[3rem] overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-teal-400/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 h-full flex flex-col justify-center p-16 xl:p-20">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <LogoIcon className="w-8 h-8" />
                </div>
                <span className="text-3xl font-bold">{SHOP.name}</span>
              </Link>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl xl:text-6xl font-bold leading-tight mb-6"
            >
              Khôi phục{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-emerald-300">
                tài khoản
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-xl text-white/80 mb-10 leading-relaxed"
            >
              Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản một cách nhanh chóng và an toàn.
            </motion.p>

            <div className="space-y-6">
              {tips.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <f.icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{f.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Panel — in normal flow, determines container height */}
        <div className="lg:ml-[50%] lg:pl-4">
          <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="w-full max-w-[680px] bg-white dark:bg-slate-800 p-10 sm:p-16 lg:p-20 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700/50 space-y-10"
            >
              <div className="text-center lg:hidden mb-6">
                <Link to="/" className="inline-flex items-center gap-3 justify-center hover:scale-105 transition-transform">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <LogoIcon className="w-10 h-10" />
                  </div>
                </Link>
              </div>

              <div className="text-center lg:text-left">
                <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Quên mật khẩu?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Đừng lo lắng, hãy nhập email hoặc số điện thoại của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                </p>
              </div>

              {!isSubmitted ? (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">
                      Email / Số điện thoại
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                      </div>
                      <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-16 pr-6 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="Nhập email hoặc SĐT" />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="group relative w-full flex justify-center items-center py-5 px-8 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 mt-6"
                  >
                    Gửi mã xác nhận <FiArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-8">
                    <FiCheckCircle className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Đã gửi mã xác nhận!</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-10">
                    Chúng tôi đã gửi liên kết khôi phục mật khẩu đến <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. Vui lòng kiểm tra hộp thư.
                  </p>
                  <button onClick={() => setIsSubmitted(false)} className="text-lg font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                    Thử lại với tài khoản khác
                  </button>
                </motion.div>
              )}

              <div className="text-center pt-4">
                <Link to="/login" className="inline-flex items-center text-lg font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <FiArrowLeft className="mr-3 h-6 w-6" /> Quay lại trang đăng nhập
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
