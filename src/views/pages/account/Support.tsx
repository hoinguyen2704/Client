import { useState } from 'react';
import { FiMessageCircle, FiPhoneCall, FiMail, FiHelpCircle, FiChevronDown, FiChevronUp, FiSend, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { mockFaqs as faqs } from '@/utils/mockAccount';

export default function Support() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hỗ trợ khách hàng</h1>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all cursor-pointer group">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <FiMessageCircle />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Chat trực tuyến</h3>
          <p className="text-slate-500 text-sm mb-4">Hỗ trợ 24/7 qua Live Chat</p>
          <button className="text-blue-600 font-medium hover:underline">Bắt đầu chat</button>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl hover:shadow-green-500/10 hover:border-green-300 transition-all cursor-pointer group">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all">
            <FiPhoneCall />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Gọi Hotline</h3>
          <p className="text-slate-500 text-sm mb-4">1900 1234 (8h00 - 22h00)</p>
          <button className="text-green-600 font-medium hover:underline">Gọi ngay</button>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all cursor-pointer group">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
            <FiMail />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Gửi Email</h3>
          <p className="text-slate-500 text-sm mb-4">Phản hồi trong vòng 24h</p>
          <button className="text-purple-600 font-medium hover:underline">support@hozitech.vn</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Message Form */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <FiHelpCircle />
            </div>
            Gửi yêu cầu hỗ trợ
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chủ đề</label>
              <select className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all">
                <option>Tư vấn sản phẩm</option>
                <option>Hỗ trợ kỹ thuật</option>
                <option>Đổi trả & Bảo hành</option>
                <option>Thanh toán & Giao hàng</option>
                <option>Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mã đơn hàng (Nếu có)</label>
              <input type="text" placeholder="VD: ORD-123456" className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nội dung chi tiết</label>
              <textarea 
                required
                rows={4} 
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-900 dark:text-white transition-all"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className={`w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                isSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isSuccess ? (
                <><FiCheckCircle className="text-xl" /> Đã gửi thành công</>
              ) : (
                <><FiSend /> Gửi yêu cầu</>
              )}
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Câu hỏi thường gặp (FAQ)</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                <button 
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {faq.question}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaqId === faq.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {openFaqId === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaqId === faq.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
