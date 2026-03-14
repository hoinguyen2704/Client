import { useState } from 'react';
import { FiTag, FiClock, FiCopy, FiCheckCircle, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { mockVouchers } from '@/utils/mockAccount';

export default function Vouchers() {
  const [activeTab, setActiveTab] = useState('active');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredVouchers = mockVouchers.filter(v => {
    if (activeTab === 'active') return v.status === 'active' || v.status === 'expiring';
    return v.status === activeTab;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kho Voucher</h1>

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-medium text-center transition-all ${
            activeTab === 'active' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Có thể dùng
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-medium text-center transition-all ${
            activeTab === 'used' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Đã dùng
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-medium text-center transition-all ${
            activeTab === 'expired' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Đã hết hạn
        </button>
      </div>

      {/* Input Code */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4">
        <input 
          type="text" 
          placeholder="Nhập mã voucher tại đây..." 
          className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 uppercase transition-all"
        />
        <button className="px-8 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 whitespace-nowrap">
          Lưu mã
        </button>
      </div>

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredVouchers.length > 0 ? (
            filteredVouchers.map(voucher => (
              <motion.div 
                key={voucher.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                className={`relative flex rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                  voucher.status === 'active' || voucher.status === 'expiring'
                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70 grayscale'
                }`}
              >
                {/* Left side - Icon/Value */}
                <div className={`w-32 flex flex-col items-center justify-center p-4 border-r-2 border-dashed border-slate-200 dark:border-slate-700 relative ${
                  voucher.type === 'discount' ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-600' : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600'
                }`}>
                  <FiTag className="text-3xl mb-2" />
                  <span className="font-bold text-xl text-center">{voucher.value}</span>
                  <span className="text-xs font-medium uppercase mt-1 opacity-80">{voucher.type === 'discount' ? 'Giảm giá' : 'Freeship'}</span>
                  
                  {/* Decorative cutouts for ticket effect */}
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full"></div>
                </div>

                {/* Right side - Details */}
                <div className="flex-1 p-5 flex flex-col justify-between relative">
                  <div>
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-bold text-lg line-clamp-1 text-slate-900 dark:text-white">{voucher.title}</h3>
                      {voucher.status === 'expiring' && (
                        <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                          <FiAlertCircle /> Sắp hết hạn
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">{voucher.description}</p>
                    <p className="text-xs text-slate-400 mb-3">Điều kiện: {voucher.condition}</p>
                    
                    {(voucher.status === 'active' || voucher.status === 'expiring') && voucher.progress > 0 && (
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${voucher.status === 'expiring' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-blue-500'}`} style={{ width: `${voucher.progress}%` }}></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${voucher.status === 'expiring' ? 'text-red-500' : 'text-slate-500'}`}>
                      <FiClock /> HSD: {voucher.expiry}
                    </div>
                    
                    {(voucher.status === 'active' || voucher.status === 'expiring') ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(voucher.code)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold"
                          title="Sao chép mã"
                        >
                          {copiedCode === voucher.code ? <><FiCheckCircle className="text-green-500" /> Đã chép</> : <><FiCopy /> Lưu mã</>}
                        </button>
                        <Link 
                          to="/cart"
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm font-bold"
                        >
                          Dùng ngay <FiShoppingCart />
                        </Link>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        {voucher.status === 'used' ? 'Đã dùng' : 'Hết hạn'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-3xl">
                <FiTag />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không có voucher nào</h3>
              <p className="text-slate-500">Bạn hiện không có voucher nào trong mục này.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
