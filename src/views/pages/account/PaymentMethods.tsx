import { useState } from 'react';
import { FiPlus, FiCreditCard, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { Button, PrimaryButton, Modal } from '@/components';
import { motion, AnimatePresence } from 'motion/react';

// Note: No server endpoint for payment methods - state managed locally
interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  name: string;
  expiry: string;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
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
        <PrimaryButton onClick={() => setIsModalOpen(true)} icon={<FiPlus className="text-base" />}>
          Thêm thẻ mới
        </PrimaryButton>
      </div>

      {methods.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <FiCreditCard className="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chưa có thẻ thanh toán</h3>
          <p className="text-slate-500">Bấm thêm thẻ mới để thanh toán nhanh hơn nhé.</p>
        </div>
      ) : (
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2" />

                {method.isDefault && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">
                    <FiCheckCircle /> Mặc định
                  </div>
                )}

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <FiCreditCard className="text-4xl opacity-80" />
                  <div className="text-2xl font-bold italic opacity-80 uppercase">{method.type}</div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="text-xl tracking-[0.2em] font-mono">•••• •••• •••• {method.last4}</div>
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

                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  {!method.isDefault && (
                    <button onClick={() => setAsDefault(method.id)}
                      className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                      Đặt làm mặc định
                    </button>
                  )}
                  <button onClick={() => deleteMethod(method.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
                    <FiTrash2 /> Xóa thẻ
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm thẻ thanh toán"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Số thẻ</label>
            <div className="relative">
              <input type="text" placeholder="0000 0000 0000 0000" className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-mono tracking-widest" maxLength={19} />
              <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            </div>
          </div>
          <div><label className="block font-medium mb-2">Tên in trên thẻ</label><input type="text" placeholder="NGUYEN VAN A" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 uppercase" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-medium mb-2">Ngày hết hạn</label><input type="text" placeholder="MM/YY" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-center" maxLength={5} /></div>
            <div><label className="block font-medium mb-2">CVV/CVC</label><input type="password" placeholder="•••" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-center tracking-widest" maxLength={3} /></div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
            <span className="font-medium">Đặt làm thẻ mặc định</span>
          </label>
          <Button onClick={() => setIsModalOpen(false)} fullWidth size="lg" className="mt-6">Lưu thẻ</Button>
        </div>
      </Modal>
    </div>
  );
}
