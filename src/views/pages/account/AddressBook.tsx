import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { mockAddresses as initialAddresses } from '@/__mocks__/mockAccount';

export default function AddressBook() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setAsDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const deleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Sổ địa chỉ</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-md gap-2"
        >
          <FiPlus /> Thêm địa chỉ mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {addresses.map(addr => (
            <motion.div 
              key={addr.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-2 transition-all relative ${addr.isDefault ? 'border-purple-500' : 'border-slate-100 dark:border-slate-800 hover:border-purple-300'}`}
            >
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-600 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">
                  Mặc định
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                  <FiMapPin />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{addr.name}</h3>
                  <p className="text-slate-500 font-medium mb-2">{addr.phone}</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{addr.address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                {!addr.isDefault ? (
                  <button 
                    onClick={() => setAsDefault(addr.id)}
                    className="text-sm font-medium text-purple-600 hover:underline"
                  >
                    Đặt làm mặc định
                  </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => deleteAddress(addr.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Thêm địa chỉ mới</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Họ và tên</label>
                    <input type="text" placeholder="Nhập họ và tên" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Số điện thoại</label>
                    <input type="tel" placeholder="Nhập số điện thoại" className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Tỉnh/Thành phố</label>
                    <select className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500">
                      <option>Chọn Tỉnh/Thành phố</option>
                      <option>Hà Nội</option>
                      <option>TP. Hồ Chí Minh</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Quận/Huyện</label>
                    <select className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500">
                      <option>Chọn Quận/Huyện</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Phường/Xã</label>
                  <select className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500">
                    <option>Chọn Phường/Xã</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Địa chỉ cụ thể</label>
                  <textarea 
                    rows={3} 
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none"
                  ></textarea>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  <span className="font-medium">Đặt làm địa chỉ mặc định</span>
                </label>
                
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-primary w-full py-4 mt-6"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
