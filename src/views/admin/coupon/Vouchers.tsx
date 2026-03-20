import { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiTag, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { mockVouchers } from '@/__mocks__/mockAdmin';

export default function AdminVouchers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-md gap-2"
        >
          <FiPlus /> Tạo Voucher mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã voucher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 uppercase"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <div className="flex gap-2">
          <select className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="scheduled">Sắp tới</option>
            <option value="expired">Hết hạn</option>
            <option value="paused">Tạm dừng</option>
          </select>
          <button className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium">
            <FiFilter /> Lọc
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="p-4 font-medium">Mã Voucher</th>
                <th className="p-4 font-medium">Loại / Giá trị</th>
                <th className="p-4 font-medium">Điều kiện</th>
                <th className="p-4 font-medium text-center">Đã dùng</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockVouchers.map((voucher) => (
                <tr key={voucher.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${voucher.type === 'discount' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        <FiTag />
                      </div>
                      <span className="font-bold font-mono tracking-wider">{voucher.code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-purple-600">{voucher.value}</div>
                    <div className="text-xs text-slate-500">{voucher.type === 'discount' ? 'Giảm giá' : 'Miễn phí vận chuyển'}</div>
                  </td>
                  <td className="p-4 text-sm">Đơn tối thiểu: <span className="font-bold">{voucher.minOrder}</span></td>
                  <td className="p-4">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{voucher.used} / {voucher.usageLimit}</span>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(voucher.used / voucher.usageLimit) * 100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <div>Từ: {voucher.startDate}</div>
                    <div>Đến: {voucher.endDate}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      voucher.status === 'active' ? 'bg-green-100 text-green-600' :
                      voucher.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                      voucher.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {voucher.status === 'active' ? 'Đang hoạt động' :
                       voucher.status === 'scheduled' ? 'Sắp tới' : 
                       voucher.status === 'paused' ? 'Tạm dừng' : 'Hết hạn'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg transition-colors" title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-colors" title="Xóa">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1-4 của 24 voucher</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">&gt;</button>
          </div>
        </div>
      </div>

      {/* Create/Edit Voucher Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-xl font-bold">Tạo Voucher Mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mã Voucher</label>
                    <input type="text" placeholder="VD: SUMMER2024" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none uppercase" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loại Giảm Giá</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="discountType" className="text-purple-600 focus:ring-purple-500" defaultChecked />
                        <span className="text-sm">Theo %</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="discountType" className="text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm">Tiền cố định</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Giá trị giảm</label>
                      <input type="number" placeholder="VD: 10" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Đơn hàng tối thiểu</label>
                      <input type="number" placeholder="VD: 500000" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Giới hạn lượt sử dụng</label>
                      <input type="number" placeholder="VD: 100" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hạn chót (Range Date)</label>
                      <input type="text" placeholder="DD/MM/YYYY - DD/MM/YYYY" className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nhóm khách hàng áp dụng</label>
                    <select multiple className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]">
                      <option value="all">Tất cả khách hàng</option>
                      <option value="new">Khách hàng mới</option>
                      <option value="vip">Khách hàng VIP</option>
                      <option value="inactive">Khách hàng lâu không mua</option>
                    </select>
                    <p className="text-xs text-slate-500">Giữ Ctrl (hoặc Cmd) để chọn nhiều nhóm</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Hủy
                </button>
                <button className="btn btn-primary btn-md gap-2">
                  <FiCheck /> Lưu Voucher
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
