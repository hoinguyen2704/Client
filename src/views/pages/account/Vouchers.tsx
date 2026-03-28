import { useState, useEffect, useCallback } from 'react';
import { FiTag, FiClock, FiCheck, FiBookmark, FiCopy, FiGift, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatPrice } from '@/helpers/format';
import couponService from '@/apis/services/couponService';
import userCouponService from '@/apis/services/userCouponService';
import useAuthStore from '@/stores/useAuthStore';
import type { CouponResponse } from '@/types';

export default function Vouchers() {
  const { user } = useAuthStore();
  const [publicVouchers, setPublicVouchers] = useState<CouponResponse[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<CouponResponse[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [searchResult, setSearchResult] = useState<CouponResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'saved' | 'search'>('discover');
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
      fetchSavedVouchers();
      toast.success('Đã lưu voucher vào ví!');
    } catch { toast.error('Lưu voucher thất bại'); }
    finally { setSavingId(null); }
  };

  const handleUnsave = async (couponId: string) => {
    setSavingId(couponId);
    try {
      await userCouponService.unsaveCoupon(couponId);
      setPublicVouchers(prev => prev.map(v => v.id === couponId ? { ...v, saved: false } : v));
      setSavedVouchers(prev => prev.filter(v => v.id !== couponId));
      toast.success('Đã xóa voucher khỏi ví');
    } catch { toast.error('Thao tác thất bại'); }
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
      setSearchResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mã không tồn tại hoặc đã bị khóa');
    }
  };

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; } };

  const daysLeft = (endDate: string): number => {
    try { return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)); }
    catch { return 0; }
  };

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
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-lg tracking-wider">{v.code}</span>
              <button onClick={() => copyCode(v.code)} className="p-1 text-slate-400 hover:text-purple-500 transition-colors"><FiCopy className="text-sm" /></button>
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
              <button onClick={() => handleUnsave(v.id)} disabled={savingId === v.id}
                className="w-full py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                <FiCheck /> Đã lưu · Nhấn để bỏ
              </button>
            ) : (
              <button onClick={() => handleSave(v.id)} disabled={savingId === v.id}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                <FiBookmark /> {savingId === v.id ? 'Đang lưu...' : 'Lưu voucher'}
              </button>
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

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[
          { key: 'discover' as const, label: 'Khám phá', icon: FiGift, count: publicVouchers.length },
          { key: 'saved' as const, label: 'Đã lưu', icon: FiBookmark, count: savedVouchers.length },
          { key: 'search' as const, label: 'Nhập mã', icon: FiTag },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.key ? 'bg-white dark:bg-slate-900 shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="text-sm" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 text-xs px-1.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Discover */}
      {activeTab === 'discover' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : publicVouchers.length === 0 ? (
            <div className="text-center py-16">
              <FiGift className="text-4xl text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Chưa có voucher nào đang hoạt động</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicVouchers.map(v => <VoucherCard key={v.id} v={v} showSaveBtn />)}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved */}
      {activeTab === 'saved' && (
        <div>
          {!user ? (
            <div className="text-center py-16">
              <FiBookmark className="text-4xl text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Đăng nhập để xem voucher đã lưu</p>
            </div>
          ) : savedVouchers.length === 0 ? (
            <div className="text-center py-16">
              <FiBookmark className="text-4xl text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Bạn chưa lưu voucher nào</p>
              <button onClick={() => setActiveTab('discover')} className="mt-3 text-sm text-purple-600 font-medium hover:underline">Khám phá voucher →</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVouchers.map(v => <VoucherCard key={v.id} v={v} showSaveBtn />)}
            </div>
          )}
        </div>
      )}

      {/* Tab: Search */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Nhập mã giảm giá</h2>
            <div className="flex gap-3">
              <input type="text" placeholder="Nhập mã giảm giá..." value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 uppercase font-mono text-lg" />
              <button onClick={handleSearch} className="btn btn-primary btn-md px-8">Kiểm tra</button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>

          <AnimatePresence>
            {searchResult && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <VoucherCard v={searchResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-3">Lưu ý</h2>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>• Mỗi mã giảm giá chỉ áp dụng 1 lần cho mỗi đơn hàng</li>
          <li>• Voucher có thời hạn sử dụng, vui lòng kiểm tra trước khi thanh toán</li>
          <li>• Lưu voucher để sử dụng nhanh chóng tại trang Checkout</li>
          <li>• Một số voucher chỉ áp dụng cho sản phẩm cụ thể</li>
        </ul>
      </div>
    </div>
  );
}
