import { useState } from 'react';
import { FiPlus, FiCreditCard, FiTrash2, FiCheckCircle, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

const initialMethods = [
  {
    id: 1,
    type: 'visa',
    last4: '4242',
    expiry: '12/25',
    name: 'NGUYEN VAN A',
    isDefault: true,
  },
  {
    id: 2,
    type: 'mastercard',
    last4: '5555',
    expiry: '08/24',
    name: 'NGUYEN VAN A',
    isDefault: false,
  },
];

export default function PaymentMethods() {
  const [methods, setMethods] = useState(initialMethods);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setAsDefault = (id: number) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const deleteMethod = (id: number) => {
    setMethods(methods.filter(method => method.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Phương thức thanh toán</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
        >
          <FiPlus /> Thêm thẻ mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {methods.map(method => (
            <motion.div 
              key={method.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative bg-gradient-to-br ${method.type === 'visa' ? 'from-blue-600 to-blue-800' : 'from-orange-500 to-red-600'} rounded-2xl p-6 shadow-lg text-white overflow-hidden group`}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
              
              {method.isDefault && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">
                  <FiCheckCircle /> Mặc định
                </div>
              )}
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <FiCreditCard className="text-4xl opacity-80" />
                <div className="text-2xl font-bold italic opacity-80 uppercase">
                  {method.type}
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="text-xl tracking-[0.2em] font-mono">
                  •••• •••• •••• {method.last4}
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Tên chủ thẻ</p>
                    <p className="font-medium tracking-wider">{method.name}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70 uppercase tracking-wider mb-1">Hết hạn</p>
                    <p className="font-medium tracking-wider">{method.expiry}</p>
                  </div>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 transition-opacity z-20">
                {!method.isDefault && (
                  <button 
                    onClick={() => setAsDefault(method.id)}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                  >
                    Đặt làm mặc định
                  </button>
                )}
                <button 
                  onClick={() => deleteMethod(method.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 /> Xóa thẻ
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Thêm thẻ thanh toán</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block font-medium mb-2">Số thẻ</label>
                  <div className="relative">
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-mono tracking-widest" maxLength={19} />
                    <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Tên in trên thẻ</label>
                  <input type="text" placeholder="NGUYEN VAN A" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 uppercase" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Ngày hết hạn</label>
                    <input type="text" placeholder="MM/YY" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-center" maxLength={5} />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">CVV/CVC</label>
                    <input type="password" placeholder="•••" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-center tracking-widest" maxLength={3} />
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  <span className="font-medium">Đặt làm thẻ mặc định</span>
                </label>
                
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all mt-6"
                >
                  Lưu thẻ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
