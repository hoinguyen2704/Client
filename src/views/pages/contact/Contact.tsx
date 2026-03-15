import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { motion } from 'motion/react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    alert('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Liên hệ với chúng tôi
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Hozitech luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây hoặc điền vào form liên hệ.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold mb-6">Thông tin liên hệ</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <FiMapPin className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Địa chỉ</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">123 Đường Công Nghệ, Phường Đổi Mới, Quận Sáng Tạo, TP.HCM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FiPhone className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Điện thoại</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">1900 1234 (Hỗ trợ 24/7)</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">0909 123 456 (Zalo/Viber)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">support@hozitech.vn</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">contact@hozitech.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <FiClock className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Giờ làm việc</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Thứ 7 - CN: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-2xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chủ đề *</label>
                    <input 
                      type="text" 
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Nhập chủ đề liên hệ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung tin nhắn *</label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="btn btn-primary btn-lg w-full md:w-auto gap-2"
                >
                  <FiSend /> Gửi tin nhắn
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
