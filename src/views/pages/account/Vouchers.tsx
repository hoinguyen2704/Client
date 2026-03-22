import { useState, useEffect } from 'react';
import { FiTag, FiClock, FiCheck } from 'react-icons/fi';
import { formatPrice } from '@/helpers/format';
import couponService from '@/apis/services/couponService';
import type { CouponResponse } from '@/types';

export default function Vouchers() {
  const [couponCode, setCouponCode] = useState('');
  const [voucher, setVoucher] = useState<CouponResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!couponCode.trim()) return;
    setLoading(true); setError(''); setVoucher(null);
    try {
      const res = await couponService.validate(couponCode);
      setVoucher(res.data);
    } catch {
      setError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    } finally { setLoading(false); }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ví voucher</h1>

      {/* Validate Coupon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-4">Kiểm tra mã giảm giá</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Nhập mã giảm giá..." value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 uppercase font-mono text-lg" />
          <button onClick={handleValidate} disabled={loading} className="btn btn-primary btn-md px-8">
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* Voucher Result */}
      {voucher && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><FiTag className="text-2xl" /></div>
            <div>
              <h3 className="text-xl font-bold">{voucher.code}</h3>
              <p className="text-white/80 text-sm">
                Giảm {voucher.discountType === 'PERCENTAGE' ? `${voucher.discountValue}%` : formatPrice(voucher.discountValue)}
                {voucher.maxDiscountAmount ? ` (tối đa ${formatPrice(voucher.maxDiscountAmount)})` : ''}
              </p>
            </div>
            <div className="ml-auto"><FiCheck className="text-3xl" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-white/70">Đơn tối thiểu</span>
              <p className="font-bold">{voucher.minOrderValue ? formatPrice(voucher.minOrderValue) : 'Không giới hạn'}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-white/70">Đã dùng</span>
              <p className="font-bold">{voucher.usedCount}/{voucher.usageLimit}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-white/70">Ngày bắt đầu</span>
              <p className="font-bold">{formatDate(voucher.startDate)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-white/70">Ngày hết hạn</span>
              <p className="font-bold flex items-center gap-1"><FiClock /> {formatDate(voucher.endDate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-3">Lưu ý</h2>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>• Mỗi mã giảm giá chỉ áp dụng 1 lần cho mỗi đơn hàng</li>
          <li>• Voucher có thời hạn sử dụng, vui lòng kiểm tra trước khi thanh toán</li>
          <li>• Nhập mã giảm giá tại trang Checkout để được giảm giá</li>
        </ul>
      </div>
    </div>
  );
}
