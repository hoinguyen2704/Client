import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'sonner';
import adminCouponService from '@/apis/services/adminCouponService';
import type { CouponResponse, PageResponse } from '@/types';
import { formatPrice } from '@/helpers/format';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { AdminSearch, AdminPagination, PrimaryButton, ActionButtons, StatusBadge, TableRowSkeleton } from '@/components/ui';
import { formatDate } from '@/utils/date';

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



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
        <PrimaryButton icon={<FiPlus className="text-base" />}>Tạo mã mới</PrimaryButton>
      </div>

      <AdminSearch
        placeholder="Tìm kiếm mã giảm giá..."
        value={searchQuery}
        onChange={(val) => { setSearchQuery(val); setPage(1); }}
      />

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
                <TableRowSkeleton rows={5} cols={7} />
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
                      <StatusBadge status={coupon.status === 'ACTIVE' ? 'active' : 'inactive'} label={coupon.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'} />
                    </td>
                    <td className="p-4 text-right">
                        <ActionButtons
                          actions={[
                            {
                              type: 'more',
                              title: coupon.status === 'ACTIVE' ? 'Tạm dừng' : 'Kích hoạt',
                              icon: coupon.status === 'ACTIVE' ? <FiToggleRight className="text-green-500 text-xl" /> : <FiToggleLeft className="text-xl" />,
                              onClick: () => handleToggle(coupon.id)
                            },
                            {
                              type: 'edit',
                              onClick: () => {} // currently empty in original code
                            }
                          ]}
                        />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData && (
          <AdminPagination
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="mã giảm giá"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
