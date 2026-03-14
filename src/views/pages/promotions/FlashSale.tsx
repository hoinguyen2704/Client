import { useState, useEffect } from 'react';
import { FiZap, FiTag, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { mockProducts } from '@/utils/mockData';
import ProductCard from '@/components/ui/ProductCard';
import { motion } from 'motion/react';

const mockVouchers = [
  { id: 'V1', code: 'HOZITECH50K', discount: 'Giảm 50K', minOrder: 'Đơn tối thiểu 500K', expiry: 'Hết hạn trong 2 giờ', type: 'all' },
  { id: 'V2', code: 'APPLE100K', discount: 'Giảm 100K', minOrder: 'Cho sản phẩm Apple', expiry: 'Hết hạn trong 5 giờ', type: 'brand' },
  { id: 'V3', code: 'FREESHIP', discount: 'Freeship', minOrder: 'Đơn tối thiểu 200K', expiry: 'Hết hạn trong 1 ngày', type: 'shipping' },
];

export default function FlashSale() {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  const flashSaleProducts = mockProducts.filter(p => p.isFlashSale);

  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-600 to-pink-500 text-white py-16 px-4 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 w-full px-4 md:px-8 lg:px-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <FiZap className="text-5xl text-yellow-400" />
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-lg">FLASH SALE</h1>
            <FiZap className="text-5xl text-yellow-400" />
          </div>
          <p className="text-xl md:text-2xl font-medium mb-8 text-purple-100">Săn deal chớp nhoáng - Giảm giá sập sàn</p>
          
          {/* Countdown */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-slate-900 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="mt-2 text-sm font-medium uppercase tracking-wider">Giờ</span>
            </div>
            <div className="text-4xl font-black pb-6">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-slate-900 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="mt-2 text-sm font-medium uppercase tracking-wider">Phút</span>
            </div>
            <div className="text-4xl font-black pb-6">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-slate-900 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="mt-2 text-sm font-medium uppercase tracking-wider">Giây</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 py-8">
        {/* Vouchers Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiTag className="text-2xl text-purple-600" />
            <h2 className="text-2xl font-bold">Mã giảm giá độc quyền</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVouchers.map(voucher => (
              <div key={voucher.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500 to-blue-500"></div>
                <div className="pl-4">
                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">{voucher.discount}</h3>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">{voucher.minOrder}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{voucher.expiry}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-mono font-bold border border-dashed border-slate-300 dark:border-slate-600">
                    {voucher.code}
                  </div>
                  <button 
                    onClick={() => handleCopyVoucher(voucher.code)}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedVoucher === voucher.code ? (
                      <><FiCheckCircle className="text-emerald-500" /> Đã chép</>
                    ) : (
                      <><FiCopy /> Sao chép</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('ongoing')}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'ongoing' ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Đang diễn ra (12:00 - 14:00)
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'upcoming' ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Sắp diễn ra (14:00 - 16:00)
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {flashSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {/* Duplicate for demo */}
          {flashSaleProducts.map(product => (
            <ProductCard key={`${product.id}-dup`} product={{...product, id: `${product.id}-dup`}} />
          ))}
        </div>
      </div>
    </div>
  );
}
