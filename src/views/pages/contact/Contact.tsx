import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { motion } from 'motion/react';
import { Button, FormInput, FormTextarea } from '@/components';
import { toast } from 'sonner';
import ticketService from '@/apis/services/ticketService';
import { getApiErrorMessage } from '@/utils/error';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await ticketService.submitContact(formData);
      toast.success('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Gửi tin nhắn thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
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
                    <p className="text-slate-500 dark:text-slate-400 text-sm">132/72/6 đường Cầu Diễn, Nguyên Xá, phường Tây Tựu, Thành phố Hà Nội</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FiPhone className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Điện thoại</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">0828443833 (Hỗ trợ 24/7)</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">0828443833 (Zalo/Viber)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">hozinium@gmail.com</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">hozinium@gmail.com</p>
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
                  <FormInput
                    label="Họ và tên *"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder="Nhập họ và tên"
                  />
                  <FormInput
                    label="Email *"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder="Nhập địa chỉ email"
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Số điện thoại"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder="Nhập số điện thoại"
                  />
                  <FormInput
                    label="Chủ đề *"
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder="Nhập chủ đề liên hệ"
                  />

                </div>

                <FormTextarea
                  label="Nội dung tin nhắn *"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                />

                <Button
                  type="submit"
                  size="lg"
                  icon={<FiSend />}
                  className="w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
