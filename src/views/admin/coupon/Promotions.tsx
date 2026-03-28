import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'sonner';
import adminCouponService from '@/apis/services/adminCouponService';
import type { CouponResponse, PageResponse } from '@/types';
import { formatPrice } from '@/helpers/format';
import { PAGE_SIZE } from '@/constants/paginationConstants';

export default function Promotions() {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<CouponResponse> | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCouponService.getAll({ keyword: searchQuery || undefined, page, size: PAGE_SIZE.LARGE });
      setPageData(res.data);
      setCoupons(res.data.data || []);
    } catch (err) { console.error('Failed to fetch coupons:', err); }
    finally { setLoading(false); }
  }, [searchQuery, page]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleToggle = async (id: string) => {
    try {
      await adminCouponService.toggleStatus(id);
      setCoupons(prev => prev.map(c =>
        c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c
      ));
      toast.success('Cập nhật trạng thái khuyến mãi thành công!');
    } catch (err) {
      console.error('Toggle failed:', err);
      toast.error('Cập nhật trạng thái khuyến mãi thất bại!');
    }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
        <button className="btn btn-primary btn-md gap-2"><FiPlus /> Tạo mã mới</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative">
          <input type="text" placeholder="Tìm kiếm mã giảm giá..."
            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium">Mã</th>
                <th className="p-4 font-medium">Loại</th>
                <th className="p-4 font-medium">Giá trị</th>
                <th className="p-4 font-medium">Sử dụng</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">Không có mã giảm giá nào</td></tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold font-mono text-purple-600">{coupon.code}</td>
                    <td className="p-4 text-sm">{coupon.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}</td>
                    <td className="p-4 font-bold">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}</td>
                    <td className="p-4">{coupon.usedCount}/{coupon.usageLimit}</td>
                    <td className="p-4 text-sm text-slate-500">{formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                        {coupon.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(coupon.id)} className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          {coupon.status === 'ACTIVE' ? <FiToggleRight className="text-green-500" /> : <FiToggleLeft />}
                        </button>
                        <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-colors"><FiEdit2 /></button>
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
    </div>
  );
}
