import { useState, useEffect, useCallback } from 'react';
import { FiSettings, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { adminSystemConfigService } from '@/apis';
import type { SystemConfigResponse, SystemConfigRequest } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { AdminSearch } from '@/components/ui';

export default function SystemConfigs() {
  const [configs, setConfigs] = useState<SystemConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfigResponse | null>(null);
  const [form, setForm] = useState<SystemConfigRequest>({ configKey: '', configValue: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminSystemConfigService.getAll({ page: 1, size: PAGE_SIZE.LARGE });
      setConfigs(res.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const openCreate = () => {
    setEditingConfig(null);
    setForm({ configKey: '', configValue: '', description: '' });
    setIsModalOpen(true);
  };

  const openEdit = (config: SystemConfigResponse) => {
    setEditingConfig(config);
    setForm({ configKey: config.configKey, configValue: config.configValue, description: config.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await adminSystemConfigService.saveOrUpdate(form);
      setIsModalOpen(false);
      fetchConfigs();
      toast.success('Lưu cấu hình thành công!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Lưu cấu hình thất bại!');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminSystemConfigService.delete(id);
      fetchConfigs();
      toast.success('Xóa cấu hình thành công!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Xóa cấu hình thất bại!');
    }
  };

  const filtered = configs.filter(c =>
    c.configKey.toLowerCase().includes(search.toLowerCase()) ||
    c.configValue?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiSettings className="text-slate-500" /> Cấu hình Hệ thống
        </h1>
        <PrimaryButton onClick={openCreate} className="w-fit" icon={<FiPlus className="text-base" />}>
          Thêm cấu hình
        </PrimaryButton>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-sm">
            <AdminSearch
              placeholder="Tìm theo key, value..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 font-medium">Config Key</th>
                <th className="p-4 font-medium">Giá trị</th>
                <th className="p-4 font-medium">Mô tả</th>
                <th className="p-4 font-medium">Cập nhật</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Không tìm thấy cấu hình nào</td></tr>
              ) : filtered.map((config) => (
                <tr key={config.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-medium text-purple-600 dark:text-purple-400">{config.configKey}</code>
                  </td>
                  <td className="p-4 text-sm max-w-xs truncate">{config.configValue}</td>
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate">{config.description || '—'}</td>
                  <td className="p-4 text-sm text-slate-400">{config.updatedAt ? new Date(config.updatedAt).toLocaleString('vi-VN') : '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(config)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Sửa">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => setDeleteTarget(config.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Xóa">
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
                <h3 className="text-xl font-bold">{editingConfig ? 'Sửa cấu hình' : 'Thêm cấu hình mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Config Key *</label>
                  <input type="text" value={form.configKey} onChange={(e) => setForm({ ...form, configKey: e.target.value })}
                    disabled={!!editingConfig}
                    className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá trị</label>
                  <textarea value={form.configValue || ''} onChange={(e) => setForm({ ...form, configValue: e.target.value })}
                    className="w-full h-24 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <input type="text" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Hủy</button>
                <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <FiCheck /> {editingConfig ? 'Cập nhật' : 'Lưu'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa cấu hình"
        message="Bạn có chắc muốn xóa cấu hình này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
