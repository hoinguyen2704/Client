import { useState } from 'react';
import { FiSave, FiSettings, FiGlobe, FiCreditCard, FiTruck, FiCpu, FiTrendingUp, FiMousePointer, FiShoppingCart, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function Settings() {
  const [paymentMethods, setPaymentMethods] = useState({
    cod: true,
    vnpay: true,
    momo: false,
  });

  const [aiSettings, setAiSettings] = useState({
    recommendation: true,
    aiContent: false,
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currency, setCurrency] = useState('VND');
  const [algorithm, setAlgorithm] = useState('collaborative');
  const [algoPriority, setAlgoPriority] = useState(70);
  const [algoExploration, setAlgoExploration] = useState(30);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cài Đặt Hệ Thống & AI</h1>
        <button className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 w-fit">
          <FiSave /> Lưu cấu hình
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
              <FiSettings />
            </div>
            <h2 className="text-lg font-bold">Cấu hình chung</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên cửa hàng</label>
              <input type="text" defaultValue="TechStore" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Đơn vị tiền tệ</label>
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { value: 'VND', label: 'VNĐ (Việt Nam Đồng)' },
                    { value: 'USD', label: 'USD (Đô la Mỹ)' }
                  ]}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thuế mặc định (%)</label>
                <input type="number" defaultValue="10" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email liên hệ</label>
              <input type="email" defaultValue="support@techstore.com" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
        </div>

        {/* AI Dashboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                <FiCpu />
              </div>
              <h2 className="text-lg font-bold">AI Dashboard (ML Ops)</h2>
            </div>
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              Cấu hình thuật toán
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">Recommendation Engine</h3>
                <p className="text-xs text-slate-500 mt-1">Hệ thống gợi ý sản phẩm tự động</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={aiSettings.recommendation} onChange={(e) => setAiSettings({...aiSettings, recommendation: e.target.checked})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">AI Content Generator</h3>
                <p className="text-xs text-slate-500 mt-1">Tự động tạo mô tả sản phẩm</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={aiSettings.aiContent} onChange={(e) => setAiSettings({...aiSettings, aiContent: e.target.checked})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-indigo-500 mb-1 flex justify-center"><FiTrendingUp /></div>
                <div className="text-xl font-bold">12.5K</div>
                <div className="text-xs text-slate-500">Lần gợi ý</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-blue-500 mb-1 flex justify-center"><FiMousePointer /></div>
                <div className="text-xl font-bold">8.2%</div>
                <div className="text-xs text-slate-500">Tỷ lệ click</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-green-500 mb-1 flex justify-center"><FiShoppingCart /></div>
                <div className="text-xl font-bold">3.4%</div>
                <div className="text-xs text-slate-500">Chuyển đổi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
              <FiCreditCard />
            </div>
            <h2 className="text-lg font-bold">Cấu hình Thanh toán</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">Thanh toán khi nhận hàng (COD)</h3>
                <p className="text-xs text-slate-500 mt-1">Cho phép khách hàng thanh toán tiền mặt</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={paymentMethods.cod} onChange={(e) => setPaymentMethods({...paymentMethods, cod: e.target.checked})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">Thanh toán qua VNPay</h3>
                <p className="text-xs text-slate-500 mt-1">Cổng thanh toán nội địa và quốc tế</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={paymentMethods.vnpay} onChange={(e) => setPaymentMethods({...paymentMethods, vnpay: e.target.checked})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">Thanh toán qua Momo</h3>
                <p className="text-xs text-slate-500 mt-1">Ví điện tử phổ biến tại Việt Nam</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={paymentMethods.momo} onChange={(e) => setPaymentMethods({...paymentMethods, momo: e.target.checked})} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
              <FiTruck />
            </div>
            <h2 className="text-lg font-bold">Cấu hình Vận chuyển</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phí ship mặc định (VNĐ)</label>
              <input type="number" defaultValue={30000} className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngưỡng Freeship (VNĐ)</label>
              <input type="number" defaultValue={500000} className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <p className="text-xs text-slate-500">Đơn hàng có giá trị lớn hơn hoặc bằng ngưỡng này sẽ được miễn phí vận chuyển.</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Config Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-xl font-bold flex items-center gap-2"><FiCpu className="text-indigo-600" /> Cấu hình Thuật toán Gợi ý</h3>
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thuật toán cốt lõi</label>
                  <CustomSelect
                    value={algorithm}
                    onChange={setAlgorithm}
                    options={[
                      { value: 'collaborative', label: 'Collaborative Filtering' },
                      { value: 'content', label: 'Content-based Filtering' },
                      { value: 'hybrid', label: 'Hybrid MLOps Model' }
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Độ ưu tiên sản phẩm mới</label>
                      <span className="text-indigo-600 font-bold">{algoPriority}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={algoPriority} onChange={(e) => setAlgoPriority(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Độ đa dạng gợi ý (Exploration)</label>
                      <span className="text-indigo-600 font-bold">{algoExploration}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={algoExploration} onChange={(e) => setAlgoExploration(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end gap-3">
                <button onClick={() => setIsAiModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Hủy
                </button>
                <button onClick={() => setIsAiModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <FiCheck /> Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
