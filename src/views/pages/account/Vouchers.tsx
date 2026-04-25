import { useState, useEffect, useCallback, memo } from 'react';
import { FiTag, FiClock, FiCheck, FiBookmark, FiCopy, FiGift, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatPrice, formatDate } from '@/utils/format';
import couponService from '@/apis/services/couponService';
import userCouponService from '@/apis/services/userCouponService';
import useAuthStore from '@/stores/useAuthStore';
import { Card, EmptyState, PrimaryButton, TrashButton, ExpandToggle } from '@/components';
import { getApiErrorMessage } from '@/utils/error';

import type { CouponResponse, VoucherCardProps, VoucherSectionProps } from '@/types';

export default function Vouchers() {
  const { t } = useTranslation(['account', 'checkout', 'common']);
  const user = useAuthStore((s) => s.user);
  const [publicVouchers, setPublicVouchers] = useState<CouponResponse[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<CouponResponse[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [searchResult, setSearchResult] = useState<CouponResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandPublic, setExpandPublic] = useState(false);
  const [expandSaved, setExpandSaved] = useState(false);

  const toggleExpandPublic = useCallback(() => setExpandPublic(prev => !prev), []);
  const toggleExpandSaved = useCallback(() => setExpandSaved(prev => !prev), []);



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

  const handleSave = useCallback(async (coupon: CouponResponse) => {
    const couponId = coupon.id;
    if (!user) { toast.error(t('account:vouchers.toasts.loginToSave')); return; }
    setSavingId(couponId);
    try {
      await userCouponService.saveCoupon(couponId);
      setPublicVouchers(prev => prev.map(v => v.id === couponId ? { ...v, saved: true } : v));
      setSearchResult(prev => prev?.id === couponId ? { ...prev, saved: true } : prev);
      setSavedVouchers(prev => {
        const existed = prev.some(v => v.id === couponId);
        if (existed) return prev;
        return [{ ...coupon, saved: true }, ...prev];
      });
      fetchSavedVouchers();
      toast.success(t('account:vouchers.toasts.saveSuccess'));
    } catch (err: unknown) { toast.error(getApiErrorMessage(err, t, 'account:vouchers.toasts.saveFailed')); }
    finally { setSavingId(null); }
  }, [user, fetchSavedVouchers, t]);

  const handleUnsave = useCallback(async (couponId: string) => {
    if (!user) { toast.error(t('account:vouchers.toasts.loginToManage')); return; }
    setSavingId(couponId);
    try {
      await userCouponService.unsaveCoupon(couponId);
      setPublicVouchers(prev => prev.map(v => v.id === couponId ? { ...v, saved: false } : v));
      setSearchResult(prev => prev?.id === couponId ? { ...prev, saved: false } : prev);
      setSavedVouchers(prev => prev.filter(v => v.id !== couponId));
      toast.success(t('account:vouchers.toasts.unsaveSuccess'));
    } catch (err: unknown) { toast.error(getApiErrorMessage(err, t, 'account:vouchers.toasts.actionFailed')); }
    finally { setSavingId(null); }
  }, [user, t]);

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('account:vouchers.toasts.copySuccess', { code }));
  }, [t]);

  const handleSearch = async () => {
    if (!couponCode.trim()) return;
    setError(''); setSearchResult(null);
    try {
      const res = await couponService.getByCode(couponCode);
      const coupon = res.data;
      const isSaved = !!coupon?.id && savedVouchers.some(v => v.id === coupon.id);
      setSearchResult(coupon ? { ...coupon, saved: isSaved } : null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t, 'account:vouchers.toasts.searchFailed'));
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

const VoucherCard = memo(({ v, showSaveBtn = false, isSaving, onCopy, onSave, onUnsave }: VoucherCardProps) => {
  const { t } = useTranslation(['account', 'checkout']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
      {/* Top gradient bar */}
      <div className={`h-1.5 ${v.discountType === 'PERCENTAGE' ? 'bg-gradient-to-r from-blue-500 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4" onClick={() => onCopy(v.code)}>
          {/* Left - icon */}
          <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${v.discountType === 'PERCENTAGE'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
            <FiTag className="text-2xl" />
          </div>
          {/* Right - info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono font-bold text-lg tracking-wider">{v.code}</span>
              <button className="p-1 text-subtle hover:text-blue-500 transition-colors"><FiCopy className="text-lg" /></button>
              <span className={`px-2 py-1 rounded-md text-10 font-bold tracking-wide uppercase ${getVoucherType(v) === 'FREESHIP'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                }`}>
                {getVoucherType(v) === 'FREESHIP' ? t('checkout:voucherCard.shippingTag') : t('checkout:voucherCard.productTag')}
              </span>
            </div>
            <div className={`text-xl font-black ${v.discountType === 'PERCENTAGE' ? 'text-blue-600' : 'text-amber-600'}`}>
              {v.discountType === 'PERCENTAGE'
                ? t('checkout:voucherCard.discountPercent', { value: v.discountValue })
                : t('checkout:voucherCard.discountAmount', { value: formatPrice(v.discountValue) })}
            </div>
            <div className="text-sm text-muted mt-0.5 h-5">
              {v.maxDiscountAmount ? t('account:vouchers.card.maxDiscount', { value: formatPrice(v.maxDiscountAmount) }) : ''}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 text-sm text-muted">
          {v.minOrderValue && (
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {t('account:vouchers.card.minOrder', { value: formatPrice(v.minOrderValue) })}
            </span>
          )}
          {v.applyType === 'SPECIFIC_PRODUCTS' && (
            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2 py-1 rounded-lg">
              <FiPackage className="text-10" /> {t('account:vouchers.card.applicableProducts', { count: v.applicableProducts?.length || 0 })}
            </span>
          )}
          {v.endDate && (
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <FiClock className="text-10" />
              {daysLeft(v.endDate) <= 3 ? (
                <span className="text-red-500 font-bold">{t('account:vouchers.card.remainingDays', { count: daysLeft(v.endDate) })}</span>
              ) : (
                <>{t('account:vouchers.card.expiry', { date: formatDate(v.endDate) })}</>
              )}
            </span>
          )}
          {v.usageLimit && (
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {t('account:vouchers.card.remainingUses', { count: v.usageLimit - v.usedCount })}
            </span>
          )}
        </div>

        {/* Save button */}
        {showSaveBtn && (
          <div className="mt-3">
            {v.saved ? (
              <div className="w-full h-10 px-3 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                <span className="text-green-600 text-md font-semibold inline-flex items-center gap-2">
                  <FiCheck />
                  {t('account:vouchers.card.savedInWallet')}
                </span>
                <TrashButton
                  onClick={() => onUnsave(v.id)}
                  disabled={isSaving}
                  title={t('checkout:voucherCard.removeSaved')}
                  className="w-10 h-10 !rounded-xl"
                />
              </div>
            ) : (
              <PrimaryButton
                onClick={() => onSave(v)}
                disabled={isSaving}
                icon={<FiBookmark />}
                className="w-full h-10 text-md"
                isLoading={isSaving}
              >
                {isSaving ? t('account:vouchers.card.saving') : t('account:vouchers.card.save')}
              </PrimaryButton>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

/* ── Memoized section — primitive props only so memo is never defeated ── */
const SECTION_ICONS = {
  gift: <FiGift className="text-blue-600" />,
  bookmark: <FiBookmark className="text-blue-600" />,
} as const;

const VoucherSection = memo(({
  iconType, title, badgeClass, vouchers, savingId, expanded, onToggle,
  loading: sectionLoading = false, minToExpand = 2,
  onCopy, onSave, onUnsave, emptyTitle, emptyDescription,
}: VoucherSectionProps) => {
  const { t } = useTranslation('common');
  const visible = expanded ? vouchers : vouchers.slice(0, minToExpand);

  return (
    <Card className="rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {SECTION_ICONS[iconType]}
          <h2 className="text-lg font-bold">{title}</h2>
          <span className={`px-2 py-1 text-sm rounded-full ${badgeClass}`}>
            {vouchers.length}
          </span>
        </div>
        {vouchers.length > minToExpand && (
          <ExpandToggle
            expanded={expanded}
            onToggle={onToggle}
            expandLabel={t('actions.expand')}
            collapseLabel={t('actions.collapse')}
            variant="outline"
          />
        )}
      </div>

      {sectionLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: minToExpand }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <EmptyState
          icon={SECTION_ICONS[iconType]}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map(v => (
            <VoucherCard
              key={v.id}
              v={v}
              showSaveBtn
              onCopy={onCopy}
              onSave={onSave}
              onUnsave={onUnsave}
              isSaving={savingId === v.id}
            />
          ))}
        </div>
      )}
    </Card>
  );
});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
          <FiGift className="text-xl" />
        </div>
        <h1 className="text-2xl font-bold">{t('account:vouchers.title')}</h1>
      </div>

      {/* Top: Input coupon */}
      <div className="space-y-4">
        <Card className="rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">{t('account:vouchers.searchTitle')}</h2>
          <div className="flex gap-3">
            <input type="text" placeholder={t('account:vouchers.searchPlaceholder')} value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 uppercase font-mono text-lg" />
            <PrimaryButton onClick={handleSearch} icon={<FiTag />} className="h-12 px-8 text-lg">
              {t('account:vouchers.check')}
            </PrimaryButton>
          </div>
          {error && <p className="text-red-500 text-md mt-3">{error}</p>}
        </Card>

        <AnimatePresence>
          {searchResult && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-bold text-muted uppercase tracking-wide">{t('account:vouchers.searchResultTitle')}</h3>
              </div>
              <VoucherCard v={searchResult} showSaveBtn onCopy={copyCode} onSave={handleSave} onUnsave={handleUnsave} isSaving={savingId === searchResult.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Middle: Public voucher vault */}
      <VoucherSection
        iconType="gift"
        title={t('account:vouchers.publicTitle')}
        badgeClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        vouchers={publicVouchers}
        savingId={savingId}
        expanded={expandPublic}
        onToggle={toggleExpandPublic}
        loading={loading}
        onCopy={copyCode}
        onSave={handleSave}
        onUnsave={handleUnsave}
        emptyTitle={t('account:vouchers.publicEmptyTitle')}
        emptyDescription={t('account:vouchers.publicEmptyDescription')}
      />

      {/* Bottom: Saved vouchers */}
      {!user ? (
        <Card className="rounded-2xl p-6">
          <EmptyState
            icon={<FiBookmark />}
            title={t('account:vouchers.loginSavedTitle')}
            description={t('account:vouchers.loginSavedDescription')}
          />
        </Card>
      ) : (
        <VoucherSection
          iconType="bookmark"
          title={t('account:vouchers.savedTitle')}
          badgeClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          vouchers={savedVouchers}
          savingId={savingId}
          expanded={expandSaved}
          onToggle={toggleExpandSaved}
          onCopy={copyCode}
          onSave={handleSave}
          onUnsave={handleUnsave}
          emptyTitle={t('account:vouchers.savedEmptyTitle')}
          emptyDescription={t('account:vouchers.savedEmptyDescription')}
        />
      )}

      {/* Notes */}
      <Card className="rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-3">{t('account:vouchers.notesTitle')}</h2>
        <ul className="space-y-2 text-md text-muted">
          <li>• {t('account:vouchers.notes.item1')}</li>
          <li>• {t('account:vouchers.notes.item2')}</li>
          <li>• {t('account:vouchers.notes.item3')}</li>
          <li>• {t('account:vouchers.notes.item4')}</li>
        </ul>
      </Card>
    </div>
  );
}
