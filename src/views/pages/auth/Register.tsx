import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowRight, FiShield, FiTruck, FiHeadphones, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import LogoIcon from '@/components/ui/LogoIcon';
import { motion } from 'motion/react';
import { authService } from '@/apis';
import useAuthStore from '@/stores/useAuthStore';
import { SHOP } from '@/constants/shopConstants';

const features = [
  { icon: FiShield, title: 'Bảo mật tuyệt đối', desc: 'Mã hóa SSL 256-bit bảo vệ mọi giao dịch' },
  { icon: FiTruck, title: 'Giao hàng siêu tốc', desc: 'Miễn phí giao hàng cho đơn từ 500K' },
  { icon: FiHeadphones, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn' },
];

export default function Register() {
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
      setPasswordStrength({ score: 1, label: 'Yếu', color: 'bg-red-500' });
    } else if (score < 5) {
      setPasswordStrength({ score: 2, label: 'Trung bình', color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score: 3, label: 'Mạnh', color: 'bg-emerald-500' });
    }
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
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

      const { accessToken, user } = res.data;
      login(accessToken, {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
        avatar: user.avatarUrl,
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      if (err?.errors && typeof err.errors === 'object') {
        const msgs = Object.entries(err.errors).map(([, msg]) => `${msg}`).join('. ');
        setError(msgs);
      } else {
        setError(err?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="relative w-full max-w-[1400px]">
        {/* Left Hero Panel — absolute so form determines height */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[calc(50%-8px)] bg-gradient-to-br from-blue-700 via-purple-600 to-pink-600 dark:from-blue-950 dark:via-slate-900 dark:to-pink-950 text-white rounded-[3rem] overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-pink-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 h-full flex flex-col justify-center p-16 xl:p-20">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <LogoIcon className="w-8 h-8" />
                </div>
                <span className="text-3xl font-bold">{SHOP.name}</span>
              </Link>
            </div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Tham gia cộng đồng{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">công nghệ</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-xl text-white/80 mb-10 leading-relaxed">
              Đăng ký ngay để nhận ưu đãi độc quyền và trải nghiệm mua sắm tuyệt vời nhất.
            </motion.p>

            <div className="space-y-6">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-5">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="w-full max-w-[680px] bg-white dark:bg-slate-800 p-10 sm:p-16 lg:p-20 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700/50 space-y-10 my-8">
              <div className="text-center lg:hidden mb-6">
                <Link to="/" className="inline-flex items-center gap-3 justify-center hover:scale-105 transition-transform">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <LogoIcon className="w-10 h-10" />
                  </div>
                </Link>
              </div>

              <div className="text-center lg:text-left">
                <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Đăng ký tài khoản</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Tạo tài khoản để trải nghiệm mua sắm tốt nhất</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-lg">
                  <FiAlertCircle className="text-xl shrink-0" /><span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl text-lg">
                  <FiCheckCircle className="text-xl shrink-0" /><span>Đăng ký thành công! Đang chuyển hướng...</span>
                </motion.div>
              )}

              <form className="space-y-8" onSubmit={handleRegister}>
                <div>
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">Họ và tên</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <FiUser className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                    </div>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-16 pr-6 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder="Nhập họ và tên" />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                    </div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-16 pr-6 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder="Nhập địa chỉ email" />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">Số điện thoại</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <FiPhone className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                    </div>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-16 pr-6 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder="Nhập số điện thoại (không bắt buộc)" />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">Mật khẩu</label>
                  <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                    </div>
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-16 pr-16 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder="Tạo mật khẩu" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-purple-600 transition-colors">
                      {showPassword ? <FiEyeOff className="text-2xl" /> : <FiEye className="text-2xl" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-3 mt-4 px-2">
                      <div className="flex-1 flex gap-2 h-2.5">
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                      </div>
                      <span className={`text-sm font-semibold uppercase tracking-wider ${passwordStrength.score === 1 ? 'text-red-500' : passwordStrength.score === 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3 ml-2">Xác nhận mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <FiLock className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-2xl" />
                    </div>
                    <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-16 pr-16 py-5 text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm" placeholder="Nhập lại mật khẩu" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-purple-600 transition-colors">
                      {showConfirmPassword ? <FiEyeOff className="text-2xl" /> : <FiEye className="text-2xl" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start pt-3">
                  <input id="terms" name="terms" type="checkbox" required
                    className="h-5 w-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer checked:bg-purple-600 checked:border-purple-600 relative shrink-0 mt-1
                      after:content-[''] after:absolute after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-white after:border-r-[3px] after:border-b-[3px] after:rotate-45 after:opacity-0 checked:after:opacity-100 transition-all" />
                  <label htmlFor="terms" className="ml-4 block text-lg text-slate-600 dark:text-slate-400 cursor-pointer">
                    Tôi đồng ý với <Link to="/terms" className="text-purple-600 hover:text-purple-500 font-semibold">Điều khoản dịch vụ</Link> và <Link to="/privacy" className="text-purple-600 hover:text-purple-500 font-semibold">Chính sách bảo mật</Link>
                  </label>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                  className="group relative w-full flex justify-center items-center py-5 px-8 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Đăng ký <FiArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </motion.button>
              </form>

              <div className="text-center pt-4">
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">Đăng nhập ngay</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
