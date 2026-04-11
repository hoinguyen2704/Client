import { useState, useEffect, useCallback } from 'react';
import { FiTag, FiClock, FiCheck, FiBookmark, FiCopy, FiGift, FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatPrice, formatDate } from '@/utils/format';
import couponService from '@/apis/services/couponService';
import userCouponService from '@/apis/services/userCouponService';
import useAuthStore from '@/stores/useAuthStore';
import { Card, EmptyState, PrimaryButton, TrashButton } from '@/components';
import { getApiErrorMessage } from '@/utils/error';

import type { CouponResponse } from '@/types';

export default function Vouchers() {
  const user = useAuthStore((s) => s.user);
  const [publicVouchers, setPublicVouchers] = useState<CouponResponse[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<CouponResponse[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [searchResult, setSearchResult] = useState<CouponResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandPublic, setExpandPublic] = useState(false);
  const [expandSaved, setExpandSaved] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);



  // Fetch public vouchers (no auth needed)
  const fetchPublicVouchers = useCallback(async () => {
    try {
      if (user) {
        const res = await userCouponService.getPublicCoupons();
        setPublicVouchers(res.data || []);
      } else {
        const res = await couponService.getPublicCoupons();
        setPublicVouchers(res.data || []);
      }
    } catch { /* ignore */ }
  }, [user]);

  // Fetch saved vouchers (auth required)
  const fetchSavedVouchers = useCallback(async () => {
    if (!user) return;
    try {
      const res = await userCouponService.getMySavedCoupons();
      setSavedVouchers(res.data || []);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPublicVouchers(), fetchSavedVouchers()])
      .finally(() => setLoading(false));
  }, [fetchPublicVouchers, fetchSavedVouchers]);

  const handleSave = async (couponId: string) => {
    if (!user) { toast.error('Vui lòng đăng nhập để lưu voucher'); return; }
    setSavingId(couponId);
    try {
      await userCouponService.saveCoupon(couponId);
      setPublicVouchers(prev => prev.map(v => v.id === couponId ? { ...v, saved: true } : v));
      setSearchResult(prev => prev?.id === couponId ? { ...prev, saved: true } : prev);
      setSavedVouchers(prev => {
        const existed = prev.some(v => v.id === couponId);
        const found = publicVouchers.find(v => v.id === couponId) || searchResult;
        if (existed || !found) return prev;
        return [{ ...found, saved: true }, ...prev];
      });
      fetchSavedVouchers();
      toast.success('Đã lưu voucher vào ví!');
    } catch (err: unknown) { toast.error(getApiErrorMessage(err, 'Lưu voucher thất bại')); }
    finally { setSavingId(null); }
  };

  const handleUnsave = async (couponId: string) => {
    if (!user) { toast.error('Vui lòng đăng nhập để quản lý voucher'); return; }
    setSavingId(couponId);
    try {
      await userCouponService.unsaveCoupon(couponId);
      setPublicVouchers(prev => prev.map(v => v.id === couponId ? { ...v, saved: false } : v));
      setSearchResult(prev => prev?.id === couponId ? { ...prev, saved: false } : prev);
      setSavedVouchers(prev => prev.filter(v => v.id !== couponId));
      toast.success('Đã xóa voucher khỏi ví');
    } catch (err: unknown) { toast.error(getApiErrorMessage(err, 'Thao tác thất bại')); }
    finally { setSavingId(null); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã ${code}`);
  };

  const handleSearch = async () => {
    if (!couponCode.trim()) return;
    setError(''); setSearchResult(null);
    try {
      const res = await couponService.getByCode(couponCode);
      const coupon = res.data;
      const isSaved = !!coupon?.id && savedVouchers.some(v => v.id === coupon.id);
      setSearchResult(coupon ? { ...coupon, saved: isSaved } : null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Mã không tồn tại hoặc đã bị khóa'));
    }
  };
  const daysLeft = (endDate: string): number => {
    try { return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)); }
    catch { return 0; }
  };

  const getVoucherType = (voucher: CouponResponse): 'FREESHIP' | 'PRODUCT' => {
    const code = (voucher.code || '').toUpperCase();
    if (code.includes('FREESHIP') || code.includes('SHIP') || code.startsWith('FS_') || code.startsWith('SHIP_')) {
      return 'FREESHIP';
    }
    return 'PRODUCT';
  };

  const getVisibleVouchers = (items: CouponResponse[], expanded: boolean) => (
    expanded ? items : items.slice(0, 2)
  );

  const VoucherCard = ({ v, showSaveBtn = false }: { v: CouponResponse; showSaveBtn?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
      {/* Top gradient bar */}
      <div className={`h-1.5 ${v.discountType === 'PERCENTAGE' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Left - icon */}
          <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${v.discountType === 'PERCENTAGE'
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
            <FiTag className="text-2xl" />
          </div>
          {/* Right - info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono font-bold text-lg tracking-wider">{v.code}</span>
              <button onClick={() => copyCode(v.code)} className="p-1 text-slate-400 hover:text-purple-500 transition-colors"><FiCopy className="text-sm" /></button>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${getVoucherType(v) === 'FREESHIP'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                }`}>
                {getVoucherType(v) === 'FREESHIP' ? 'Freeship' : 'Giảm giá SP'}
              </span>
            </div>
            <div className={`text-xl font-black ${v.discountType === 'PERCENTAGE' ? 'text-purple-600' : 'text-amber-600'}`}>
              {v.discountType === 'PERCENTAGE' ? `Giảm ${v.discountValue}%` : `Giảm ${formatPrice(v.discountValue)}`}
            </div>
            {v.maxDiscountAmount && (
              <div className="text-xs text-slate-500 mt-0.5">Tối đa {formatPrice(v.maxDiscountAmount)}</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 text-xs text-slate-500">
          {v.minOrderValue && (
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              Đơn tối thiểu {formatPrice(v.minOrderValue)}
            </span>
          )}
          {v.applyType === 'SPECIFIC_PRODUCTS' && (
            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2 py-1 rounded-lg">
              <FiPackage className="text-[10px]" /> {v.applicableProducts?.length || 0} SP
            </span>
          )}
          {v.endDate && (
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <FiClock className="text-[10px]" />
              {daysLeft(v.endDate) <= 3 ? (
                <span className="text-red-500 font-bold">Còn {daysLeft(v.endDate)} ngày</span>
              ) : (
                <>HSD: {formatDate(v.endDate)}</>
              )}
            </span>
          )}
          {v.usageLimit && (
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              Còn {v.usageLimit - v.usedCount} lượt
            </span>
          )}
        </div>

        {/* Save button */}
        {showSaveBtn && (
          <div className="mt-3">
            {v.saved ? (
              <div className="w-full h-10 px-3 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                <span className="text-green-600 text-sm font-semibold inline-flex items-center gap-2">
                  <FiCheck />
                  Đã lưu trong ví
                </span>
                <TrashButton
                  onClick={() => handleUnsave(v.id)}
                  disabled={savingId === v.id}
                  title="Bỏ lưu mã"
                  className="w-8 h-8 rounded-lg"
                />
              </div>
            ) : (
              <PrimaryButton
                onClick={() => handleSave(v.id)}
                disabled={savingId === v.id}
                icon={<FiBookmark />}
                className="w-full h-10 text-sm"
                isLoading={savingId === v.id}
              >
                {savingId === v.id ? 'Đang lưu...' : 'Lưu voucher'}
              </PrimaryButton>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
          <FiGift className="text-xl" />
        </div>
        <h1 className="text-2xl font-bold">Ví voucher</h1>
      </div>

      {/* Top: Input coupon */}
      <div className="space-y-4">
        <Card className="rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Nhập mã giảm giá</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="Nhập mã giảm giá..." value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 uppercase font-mono text-lg" />
            <PrimaryButton onClick={handleSearch} icon={<FiTag />} className="h-12 px-8 text-lg">
              Kiểm tra
            </PrimaryButton>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </Card>

        <AnimatePresence>
          {searchResult && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Kết quả kiểm tra mã</h3>
              </div>
              <VoucherCard v={searchResult} showSaveBtn />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Middle: Public voucher vault */}
      <Card className="rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiGift className="text-purple-600" />
            <h2 className="text-lg font-bold">Kho voucher</h2>
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {publicVouchers.length}
            </span>
          </div>
          {publicVouchers.length > 2 && (
            <PrimaryButton
              onClick={() => setExpandPublic(prev => !prev)}
              variant="outline"
              icon={expandPublic ? <FiChevronUp /> : <FiChevronDown />}
              className="h-8 px-3 text-xs shadow-none"
            >
              {expandPublic ? 'Thu gọn' : 'Mở rộng'}
            </PrimaryButton>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : publicVouchers.length === 0 ? (
          <EmptyState
            icon={<FiGift />}
            title="Chưa có voucher nào đang hoạt động"
            description="Bạn có thể quay lại sau để xem thêm ưu đãi mới."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getVisibleVouchers(publicVouchers, expandPublic).map(v => <VoucherCard key={v.id} v={v} showSaveBtn />)}
          </div>
        )}
      </Card>

      {/* Bottom: Saved vouchers */}
      <Card className="rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiBookmark className="text-purple-600" />
            <h2 className="text-lg font-bold">Mã đã lưu</h2>
            <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {savedVouchers.length}
            </span>
          </div>
          {savedVouchers.length > 2 && user && (
            <PrimaryButton
              onClick={() => setExpandSaved(prev => !prev)}
              variant="outline"
              icon={expandSaved ? <FiChevronUp /> : <FiChevronDown />}
              className="h-8 px-3 text-xs shadow-none"
            >
              {expandSaved ? 'Thu gọn' : 'Mở rộng'}
            </PrimaryButton>
          )}
        </div>

        {!user ? (
          <EmptyState
            icon={<FiBookmark />}
            title="Đăng nhập để xem mã đã lưu"
            description="Các voucher bạn lưu sẽ hiển thị tại đây."
          />
        ) : savedVouchers.length === 0 ? (
          <EmptyState
            icon={<FiBookmark />}
            title="Bạn chưa lưu voucher nào"
            description="Hãy lưu voucher từ Kho voucher để dùng nhanh ở Checkout."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getVisibleVouchers(savedVouchers, expandSaved).map(v => <VoucherCard key={v.id} v={v} showSaveBtn />)}
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card className="rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-3">Lưu ý</h2>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>• Mỗi mã giảm giá chỉ áp dụng 1 lần cho mỗi đơn hàng</li>
          <li>• Voucher có thời hạn sử dụng, vui lòng kiểm tra trước khi thanh toán</li>
          <li>• Lưu voucher để sử dụng nhanh chóng tại trang Checkout</li>
          <li>• Một số voucher chỉ áp dụng cho sản phẩm cụ thể</li>
        </ul>
      </Card>
    </div>
  );
}
