import { useState, useEffect, useCallback } from 'react';
import { FiZap, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { adminFlashSaleService } from '@/apis';
import type { FlashSaleResponse } from '@/types';
import type { FlashSaleRequest } from '@/apis/services/adminFlashSaleService';

export default function FlashSales() {
  const [sales, setSales] = useState<FlashSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSaleResponse | null>(null);
  const [form, setForm] = useState<FlashSaleRequest>({ name: '', startTime: '', endTime: '' });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFlashSaleService.getAll({ page: 1, size: 50 });
      setSales(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const openCreate = () => {
    setEditingSale(null);
    setForm({ name: '', description: '', startTime: '', endTime: '' });
    setIsModalOpen(true);
  };

  const openEdit = (sale: FlashSaleResponse) => {
    setEditingSale(sale);
    setForm({
      name: sale.name,
      description: sale.description || '',
      startTime: sale.startTime?.slice(0, 16) || '',
      endTime: sale.endTime?.slice(0, 16) || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingSale) {
        await adminFlashSaleService.update(editingSale.id, form);
      } else {
        await adminFlashSaleService.create(form);
      }
      setIsModalOpen(false);
      fetchSales();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa Flash Sale này?')) return;
    try {
      await adminFlashSaleService.delete(id);
      fetchSales();
    } catch { /* ignore */ }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-600';
      case 'UPCOMING': return 'bg-blue-100 text-blue-600';
      case 'ENDED': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Đang diễn ra';
      case 'UPCOMING': return 'Sắp diễn ra';
      case 'ENDED': return 'Đã kết thúc';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiZap className="text-yellow-500" /> Quản lý Flash Sale
        </h1>
        <button onClick={openCreate} className="px-5 h-10 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 w-fit">
          <FiPlus /> Tạo Flash Sale
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 font-medium">Tên sự kiện</th>
                <th className="p-4 font-medium">Bắt đầu</th>
                <th className="p-4 font-medium">Kết thúc</th>
                <th className="p-4 font-medium">Sản phẩm</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Chưa có Flash Sale nào</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-sm">{sale.name}</div>
                    {sale.description && <div className="text-xs text-slate-400 mt-1">{sale.description}</div>}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(sale.startTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(sale.endTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 text-sm font-medium">{sale.items?.length || 0} SP</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(sale.status)}`}>
                      {statusLabel(sale.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(sale)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Sửa">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(sale.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Xóa">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">{editingSale ? 'Sửa Flash Sale' : 'Tạo Flash Sale mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên sự kiện *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-24 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bắt đầu *</label>
                    <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kết thúc *</label>
                    <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Hủy</button>
                <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <FiCheck /> {editingSale ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
