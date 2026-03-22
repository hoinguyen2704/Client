import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTag, FiToggleLeft, FiToggleRight, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import adminCouponService from '@/apis/services/adminCouponService';
import type { CouponResponse, CouponRequest, PageResponse } from '@/types';
import { formatPrice } from '@/helpers/format';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<CouponResponse> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<CouponRequest>>({ discountType: 'PERCENTAGE' });

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCouponService.getAll({ keyword: searchQuery || undefined, page, size: 20 });
      setPageData(res.data); setVouchers(res.data.data || []);
    } catch (err) { console.error('Failed:', err); }
    finally { setLoading(false); }
  }, [searchQuery, page]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleToggle = async (id: string) => {
    try { await adminCouponService.toggleStatus(id); fetchVouchers(); }
    catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    try {
      await adminCouponService.create(form as CouponRequest);
      setIsModalOpen(false); setForm({ discountType: 'PERCENTAGE' }); fetchVouchers();
    } catch (err) { console.error(err); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-md gap-2"><FiPlus /> Tạo Voucher mới</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Tìm kiếm theo mã voucher..."
            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 uppercase" />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium">Mã Voucher</th>
                <th className="p-4 font-medium">Loại / Giá trị</th>
                <th className="p-4 font-medium text-center">Đã dùng</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Không có voucher nào</td></tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600"><FiTag /></div>
                        <span className="font-bold font-mono tracking-wider">{v.code}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-purple-600">{v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatPrice(v.discountValue)}</div>
                      <div className="text-xs text-slate-500">{v.discountType === 'PERCENTAGE' ? 'Giảm giá' : 'Cố định'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{v.usedCount} / {v.usageLimit}</span>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(v.usedCount / v.usageLimit) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      <div>Từ: {formatDate(v.startDate)}</div>
                      <div>Đến: {formatDate(v.endDate)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                        {v.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(v.id)} className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          {v.status === 'ACTIVE' ? <FiToggleRight className="text-green-500" /> : <FiToggleLeft />}
                        </button>
                        <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><FiEdit2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData && pageData.lastPage > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <div>Trang {page}/{pageData.lastPage}</div>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&lt;</button>
              {Array.from({ length: Math.min(pageData.lastPage, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${p === page ? 'bg-purple-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageData.lastPage, p + 1))} disabled={page === pageData.lastPage} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Voucher Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-xl font-bold">Tạo Voucher Mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"><FiX className="text-xl" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã Voucher</label>
                  <input type="text" placeholder="VD: SUMMER2024" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại Giảm Giá</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="discountType" checked={form.discountType === 'PERCENTAGE'} onChange={() => setForm({ ...form, discountType: 'PERCENTAGE' })} className="text-purple-600" />
                      <span className="text-sm">Theo %</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="discountType" checked={form.discountType === 'FIXED'} onChange={() => setForm({ ...form, discountType: 'FIXED' })} className="text-purple-600" />
                      <span className="text-sm">Tiền cố định</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giá trị giảm</label>
                    <input type="number" placeholder="VD: 10" value={form.discountValue || ''} onChange={(e) => setForm({ ...form, discountValue: +e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Đơn tối thiểu</label>
                    <input type="number" placeholder="500000" value={form.minOrderValue || ''} onChange={(e) => setForm({ ...form, minOrderValue: +e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giới hạn sử dụng</label>
                    <input type="number" placeholder="100" value={form.usageLimit || ''} onChange={(e) => setForm({ ...form, usageLimit: +e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giảm tối đa</label>
                    <input type="number" placeholder="100000" value={form.maxDiscountAmount || ''} onChange={(e) => setForm({ ...form, maxDiscountAmount: +e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày bắt đầu</label>
                    <input type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày kết thúc</label>
                    <input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200 transition-colors">Hủy</button>
                <button onClick={handleCreate} className="btn btn-primary btn-md gap-2"><FiCheck /> Lưu Voucher</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
