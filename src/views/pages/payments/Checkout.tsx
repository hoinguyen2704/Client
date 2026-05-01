import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMapPin, FiTag, FiCheck, FiPlus, FiEdit2, FiBookmark, FiGift, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Checkbox, IconButton, Modal, ModalCancelButton, OrderItemsTable, PrimaryButton, Radio, SectionCard } from '@/components';
import { formatPrice } from '@/utils/format';
import cartService from '@/apis/services/cartService';
import addressService from '@/apis/services/addressService';
import couponService from '@/apis/services/couponService';
import userCouponService from '@/apis/services/userCouponService';
import orderService from '@/apis/services/orderService';
import settingService from '@/apis/services/settingService';
import type { CartResponse, AddressResponse, AddressRequest, CouponResponse, PaymentMethodConfig, ShippingConfig, TaxConfig } from '@/types';
import useAuthStore from '@/stores/useAuthStore';
import useCartStore from '@/stores/useCartStore';
import { getApiErrorMessage, getApiErrorCode } from '@/utils/error';
import CheckoutAppliedCouponCard from './components/CheckoutAppliedCouponCard';
import CheckoutVoucherCard from './components/CheckoutVoucherCard';

type CheckoutSource = 'buyNow' | 'selectedCart' | 'cart';

interface BuyNowCheckoutStateItem {
  productId: string;
  variantId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variantName?: string;
}

const createCheckoutIdempotencyKey = () => {
  if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const buildBuyNowCartItem = (buyNowItem: BuyNowCheckoutStateItem): CartResponse => ({
  id: 'buy-now',
  variantId: buyNowItem.variantId,
  variantSku: '',
  productName: buyNowItem.name,
  imageUrl: buyNowItem.image,
  price: buyNowItem.price,
  quantity: buyNowItem.quantity,
  subtotal: buyNowItem.price * buyNowItem.quantity,
  variantName: buyNowItem.variantName || '',
  productSlug: '',
  stockQuantity: 999,
  available: true,
});

export default function Checkout() {
  const { t } = useTranslation(['checkout', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const syncCartCount = useCartStore((s) => s.syncFromServer);
  const buyNowItem = location.state?.buyNowItem as BuyNowCheckoutStateItem | undefined;
  const selectedCartItems = location.state?.selectedCartItems as CartResponse[] | undefined;
  const checkoutSource: CheckoutSource = buyNowItem
    ? 'buyNow'
    : selectedCartItems && selectedCartItems.length > 0
      ? 'selectedCart'
      : 'cart';

  const [cartItems, setCartItems] = useState<CartResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [productCouponCode, setProductCouponCode] = useState('');
  const [shippingCouponCode, setShippingCouponCode] = useState('');
  const [validatedProductCoupon, setValidatedProductCoupon] = useState<CouponResponse | null>(null);
  const [validatedShippingCoupon, setValidatedShippingCoupon] = useState<CouponResponse | null>(null);
  const [savedCouponIds, setSavedCouponIds] = useState<string[]>([]);
  const [productDiscount, setProductDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);
  const [inputCouponCode, setInputCouponCode] = useState(''); // Text input
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({ defaultShippingFee: 30000, freeShippingThreshold: 500000 });
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    enabled: true,
    taxPercent: 10,
    taxMode: 'INCLUDED',
    applyOnShipping: true,
  });
  const [publicVouchers, setPublicVouchers] = useState<CouponResponse[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<CouponResponse[]>([]);
  const [expandPublic, setExpandPublic] = useState(false);
  const [expandSaved, setExpandSaved] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [savingVoucherId, setSavingVoucherId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressRequest>({ fullName: '', phoneNumber: '', province: '', district: '', ward: '', detailAddress: '', isDefault: false });
  const [editId, setEditId] = useState<string | null>(null);
  const checkoutIdempotencyKeyRef = useRef<string>(createCheckoutIdempotencyKey());

  const resetForm = () => { setForm({ fullName: '', phoneNumber: '', province: '', district: '', ward: '', detailAddress: '', isDefault: false }); setEditId(null); setShowForm(false); };

  const handleSaveAddress = async () => {
    try {
      if (editId) { await addressService.update(editId, form); }
      else { await addressService.create(form); }
      resetForm();
      const res = await addressService.getMyAddresses();
      setAddresses(res.data || []);
      if (res.data?.length) {
        const def = res.data.find(a => a.isDefault);
        setSelectedAddressId(def ? def.id : res.data[res.data.length - 1].id);
      }
      toast.success(t('address.saveSuccess'));
    } catch {
      toast.error(t('address.saveFailed'));
    }
  };

  const handleEditAddress = (addr: AddressResponse) => {
    setEditId(addr.id);
    setForm({ fullName: addr.fullName, phoneNumber: addr.phoneNumber, province: addr.province, district: addr.district, ward: addr.ward, detailAddress: addr.detailAddress, isDefault: addr.isDefault });
    setShowForm(true);
  };

  const loadCartData = async () => {
    if (checkoutSource === 'buyNow' && buyNowItem) {
      setCartItems([buildBuyNowCartItem(buyNowItem)]);
      return;
    }

    if (checkoutSource === 'selectedCart' && selectedCartItems && selectedCartItems.length > 0) {
      setCartItems(selectedCartItems);
      return;
    }

    const r = await cartService.getMyCart();
    setCartItems(r.data || []);
  };

  const syncCheckoutItemsFromServer = async () => {
    if (checkoutSource === 'buyNow') {
      return;
    }

    const r = await cartService.getMyCart();
    const serverItems = r.data || [];

    if (checkoutSource === 'selectedCart' && selectedCartItems && selectedCartItems.length > 0) {
      const selectedVariantIds = new Set(selectedCartItems.map((item) => item.variantId));
      setCartItems(serverItems.filter((item) => selectedVariantIds.has(item.variantId)));
      return;
    }

    setCartItems(serverItems);
  };

  const markCurrentCheckoutItemsUnavailable = (issueMessage: string, issueCode?: string) => {
    setCartItems((prev) => prev.map((item) => ({
      ...item,
      available: false,
      issueCode: issueCode || item.issueCode,
      issueMessage,
    })));
  };

  const loadAddressData = async () => {
    const r = await addressService.getMyAddresses();
    setAddresses(r.data || []);
    const def = (r.data || []).find(a => a.isDefault);
    if (def) setSelectedAddressId(def.id);
  };

  const loadCouponData = async () => {
    if (!user) {
      setSavedCouponIds([]);
      setSavedVouchers([]);
      return;
    }
    try {
      const r = await userCouponService.getMySavedCoupons();
      const coupons = r.data || [];
      setSavedVouchers(coupons);
      setSavedCouponIds(coupons.map(coupon => coupon.id));
    } catch {
      setSavedCouponIds([]);
      setSavedVouchers([]);
    }
  };

  const loadPublicVoucherData = async () => {
    try {
      const r = user ? await userCouponService.getPublicCoupons() : await couponService.getPublicCoupons();
      setPublicVouchers(r.data || []);
    } catch {
      setPublicVouchers([]);
    }
  };

  useEffect(() => {
    Promise.all([
      loadCartData(),
      loadAddressData(),
      loadCouponData(),
      loadPublicVoucherData(),
      settingService.getShipping().then(res => { if (res.data) setShippingConfig(res.data); }).catch(() => { }),
      settingService.getTax().then(res => { if (res.data) setTaxConfig(res.data); }).catch(() => { }),
      settingService.getPaymentMethods().then(res => {
        if (res.data) {
          setPaymentMethods(res.data.filter(pm => pm.enabled));
          const first = res.data.find(pm => pm.enabled);
          if (first) setPaymentMethod(first.id);
        }
      }).catch(() => { }),
    ]).finally(() => setLoading(false));
  }, [user]);



  const getVoucherType = (voucher: CouponResponse): 'FREESHIP' | 'PRODUCT' => {
    return voucher.couponCategory === 'SHIPPING' ? 'FREESHIP' : 'PRODUCT';
  };

  const handleRemoveCoupon = (category: 'SHIPPING' | 'PRODUCT') => {
    if (category === 'SHIPPING') {
      setValidatedShippingCoupon(null);
      setShippingCouponCode('');
      setShippingDiscount(0);
    } else {
      setValidatedProductCoupon(null);
      setProductCouponCode('');
      setProductDiscount(0);
    }
    toast.success(t('toasts.couponRemoved'));
  };

  const getVisibleVouchers = (items: CouponResponse[], expanded: boolean) => (
    expanded ? items : items.slice(0, 1)
  );

  const applyCouponCode = async (code: string) => {
    if (!code) return false;
    try {
      const normalized = code.toUpperCase();
      const res = await couponService.validate(normalized, subtotal);
      const coupon = res.data;

      if (coupon.couponCategory === 'SHIPPING') {
        setValidatedShippingCoupon(coupon || null);
        setShippingCouponCode(normalized);
        let currShippingFee = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.defaultShippingFee;
        let d = 0;
        if (coupon.discountType === 'PERCENTAGE') {
          d = currShippingFee * coupon.discountValue / 100;
          if (coupon.maxDiscountAmount) d = Math.min(d, coupon.maxDiscountAmount);
        } else {
          d = coupon.discountValue || currShippingFee;
        }
        setShippingDiscount(Math.min(d, currShippingFee));
      } else {
        setValidatedProductCoupon(coupon || null);
        setProductCouponCode(normalized);
        let d = 0;
        if (coupon.discountType === 'PERCENTAGE') {
          d = subtotal * coupon.discountValue / 100;
          if (coupon.maxDiscountAmount) d = Math.min(d, coupon.maxDiscountAmount);
        } else {
          d = coupon.discountValue;
        }
        setProductDiscount(d);
      }

      toast.success(t('toasts.couponApplied'));
      return true;
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'checkout:toasts.invalidCoupon'));
      return false;
    }
  };

  const handleApplyCoupon = async () => {
    if (!inputCouponCode) return;
    await applyCouponCode(inputCouponCode);
    setInputCouponCode('');
  };

  const handleApplyVoucherFromList = async (voucher: CouponResponse) => {
    const ok = await applyCouponCode(voucher.code);
    if (ok) setShowVoucherModal(false);
  };

  const handleSaveVoucher = async (voucher: CouponResponse) => {
    if (!user) {
      toast.error(t('toasts.loginToSaveVoucher'));
      return;
    }
    setSavingVoucherId(voucher.id);
    try {
      await userCouponService.saveCoupon(voucher.code);
      setSavedCouponIds(prev => prev.includes(voucher.id) ? prev : [...prev, voucher.id]);
      setPublicVouchers(prev => prev.map(v => v.id === voucher.id ? { ...v, saved: true } : v));
      setSavedVouchers(prev => prev.some(v => v.id === voucher.id) ? prev : [{ ...voucher, saved: true }, ...prev]);
      toast.success(t('toasts.voucherSaved'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'checkout:toasts.voucherSaveFailed'));
    } finally {
      setSavingVoucherId(null);
    }
  };

  const handleUnsaveVoucher = async (voucherId: string) => {
    if (!user) {
      toast.error(t('toasts.loginToManageVoucher'));
      return;
    }
    setSavingVoucherId(voucherId);
    try {
      const voucher = [...publicVouchers, ...savedVouchers].find((item) => item.id === voucherId);
      if (!voucher) {
        toast.error(t('checkout:toasts.voucherUnsaveFailed'));
        return;
      }
      await userCouponService.unsaveCoupon(voucher.code);
      setSavedCouponIds(prev => prev.filter(id => id !== voucherId));
      setSavedVouchers(prev => prev.filter(v => v.id !== voucherId));
      setPublicVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, saved: false } : v));
      if (validatedProductCoupon?.id === voucherId) {
        setValidatedProductCoupon(prev => prev ? { ...prev, saved: false } : prev);
      }
      if (validatedShippingCoupon?.id === voucherId) {
        setValidatedShippingCoupon(prev => prev ? { ...prev, saved: false } : prev);
      }
      toast.success(t('toasts.voucherUnsaved'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t, 'checkout:toasts.voucherUnsaveFailed'));
    } finally {
      setSavingVoucherId(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAddressId) { toast.warning(t('toasts.addressRequired')); return; }
    if (cartItems.length === 0) { toast.warning(t('toasts.cartEmpty')); return; }
    if (cartItems.some(item => item.available === false)) {
      toast.warning(t('toasts.cartUnavailable'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await orderService.checkout({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: productCouponCode || undefined,
        shippingCouponCode: shippingCouponCode || undefined,
        note: note || undefined,
        items: cartItems.map(i => ({
          variantId: i.variantId,
          quantity: i.quantity,
          expectedUnitPrice: i.price,
        })),
      }, checkoutIdempotencyKeyRef.current);
      checkoutIdempotencyKeyRef.current = createCheckoutIdempotencyKey();
      await syncCartCount();
      if (res.data?.paymentUrl) { window.location.href = res.data.paymentUrl; }
      else {
        toast.success(t('toasts.orderSuccess'));
        navigate(`/user/orders/${res.data?.orderNumber}`);
      }
    } catch (err: unknown) {
      const errorCode = getApiErrorCode(err);
      const errorMessage = getApiErrorMessage(err, t, 'checkout:toasts.orderFailed');
      toast.error(errorMessage);
      if ([
        'PRICE_CHANGED',
        'INSUFFICIENT_STOCK',
        'PRODUCT_NOT_AVAILABLE',
        'VARIANT_NOT_AVAILABLE',
      ].includes(errorCode)) {
        if (checkoutSource === 'buyNow') {
          markCurrentCheckoutItemsUnavailable(errorMessage, errorCode);
        } else {
          await syncCheckoutItemsFromServer();
        }
      }
    }
    finally { setSubmitting(false); }
  };

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const shippingFee = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.defaultShippingFee;
  const roundMoney = (value: number) => Math.round(Math.max(0, value) * 100) / 100;
  const productBase = roundMoney(subtotal - productDiscount);
  const shippingBase = roundMoney(shippingFee - shippingDiscount);
  const taxableAmount = roundMoney(taxConfig.applyOnShipping ? (productBase + shippingBase) : productBase);
  const shouldApplyTax = taxConfig.enabled && taxConfig.taxPercent > 0;
  const taxAmount = shouldApplyTax
    ? (taxConfig.taxMode === 'EXCLUDED'
      ? roundMoney(taxableAmount * taxConfig.taxPercent / 100)
      : roundMoney(taxableAmount * taxConfig.taxPercent / (100 + taxConfig.taxPercent)))
    : 0;
  const total = taxConfig.taxMode === 'EXCLUDED' && shouldApplyTax
    ? roundMoney(productBase + shippingBase + taxAmount)
    : roundMoney(productBase + shippingBase);
  const isAppliedProductCouponSaved = !!validatedProductCoupon?.id && savedCouponIds.includes(validatedProductCoupon.id);
  const isAppliedShippingCouponSaved = !!validatedShippingCoupon?.id && savedCouponIds.includes(validatedShippingCoupon.id);
  const checkoutItems = cartItems.map((item) => ({
    id: item.id,
    productName: item.productName,
    variantName: item.variantName,
    imageUrl: item.imageUrl,
    unitPrice: Number(item.price || 0),
    quantity: item.quantity,
    subtotal: item.subtotal,
    issueMessage: item.available === false
      ? item.issueMessage || t('items.unavailable')
      : undefined,
  }));

  if (loading) return <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 py-8 sm:py-12"><div className="h-80 sm:h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 md:py-12 space-y-5 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-ink mb-1 sm:mb-2">{t('title')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:gap-8 xl:grid-cols-12">
        <div className="space-y-4 sm:space-y-8 xl:col-span-8">
          {/* Address */}
          <SectionCard
            title={t('address.title')}
            icon={<FiMapPin className="mt-0.5" />}
            action={
              <Button
                type="button"
                onClick={() => { resetForm(); setShowForm(true); }}
                variant="ghost"
                size="sm"
                icon={<FiPlus className="group-hover:rotate-90 transition-transform" />}
                className="group w-full justify-center text-md text-blue-600 hover:text-blue-700 dark:text-blue-400 sm:w-auto"
              >
                {t('address.addNew')}
              </Button>
            }
          >
            {addresses.length === 0 ? (
              <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-5 sm:p-8 mb-2 sm:mb-4 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 relative z-10 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <FiMapPin className="text-xl sm:text-2xl text-blue-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2 relative z-10 text-ink">{t('address.emptyTitle')}</h3>
                <p className="text-md text-muted mb-6 max-w-sm relative z-10">{t('address.emptyDescription')}</p>
                <Button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(true); }}
                  variant="outline"
                  size="sm"
                  icon={<FiPlus />}
                  className="px-6 border-blue-100 dark:border-blue-900/50 hover:border-blue-500 hover:text-blue-700 text-blue-600 dark:text-blue-400 relative z-10 shadow-sm hover:shadow-md"
                >
                  {t('address.emptyAction')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-[44vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <Radio
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onCheckedChange={(checked) => checked && setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-md sm:text-base text-ink">{addr.fullName}</span>
                          <span className="text-subtle">|</span>
                          <span className="font-medium text-md sm:text-base text-muted">{addr.phoneNumber}</span>
                          {addr.isDefault && <span className="px-2.5 py-1 rounded-md text-11 font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 uppercase tracking-wide">{t('address.default')}</span>}
                        </div>
                        <IconButton
                          onClick={() => handleEditAddress(addr)}
                          icon={<FiEdit2 />}
                          title={t('address.edit')}
                          variant="ghost"
                          className="text-subtle hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        />
                      </div>
                      <p className="text-sm sm:text-md text-muted leading-relaxed">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </SectionCard>

          <OrderItemsTable
            title={t('items.title', { count: cartItems.length })}
            items={checkoutItems}
            labels={{
              product: t('items.product'),
              variant: t('items.variant'),
              unitPrice: t('items.unitPrice'),
              quantity: t('items.quantity'),
              lineTotal: t('items.lineTotal'),
            }}
            showIssueMessage
          />

          {/* Payment */}
          <SectionCard title={t('payment.title')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {paymentMethods.map(pm => (
                <label key={pm.id} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === pm.id ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                  <Radio
                    name="payment"
                    checked={paymentMethod === pm.id}
                    onCheckedChange={(checked) => checked && setPaymentMethod(pm.id)}
                  />
                  <span className="font-medium text-md">{pm.label}</span>
                </label>
              ))}
            </div>
          </SectionCard>

          {/* Note */}
          <SectionCard title={t('note.title')}>
            <textarea className="w-full h-24 sm:h-20 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none text-md sm:text-base" placeholder={t('note.placeholder')} value={note} onChange={(e) => setNote(e.target.value)} />
          </SectionCard>
        </div>

        {/* Summary */}
        <SectionCard
          title={t('summary.title')}
          className="h-fit sm:rounded-3xl sm:p-7 xl:sticky xl:top-24 xl:col-span-4 xl:p-8"
          contentClassName="space-y-5 sm:space-y-6"
          titleClassName="text-xl font-black tracking-tight sm:text-[2rem]"
          headerSeparated
        >
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="space-y-3">
              <div className="flex gap-2.5 sm:gap-3">
                <input
                  className="min-w-0 flex-1 px-3.5 sm:px-4 py-3 rounded-xl bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-md uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:font-sans"
                  placeholder={t('summary.couponPlaceholder')}
                  value={inputCouponCode}
                  onChange={(e) => {
                    setInputCouponCode(e.target.value.toUpperCase());
                  }}
                />
                <IconButton
                  onClick={handleApplyCoupon}
                  icon={<FiTag className="text-lg" />}
                  variant="ghost"
                  className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  title={t('summary.applyCoupon')}
                />
              </div>
              <PrimaryButton
                onClick={() => setShowVoucherModal(true)}
                variant="outline"
                icon={<FiGift />}
                className="w-full h-11 sm:h-12 rounded-xl text-md font-semibold"
              >
                {t('summary.chooseVoucher')}
              </PrimaryButton>
            </div>
          </div>
          {(validatedProductCoupon || validatedShippingCoupon) && (
            <div className="space-y-3">
              {validatedProductCoupon && (
                <CheckoutAppliedCouponCard
                  coupon={validatedProductCoupon}
                  variant="product"
                  userLoggedIn={!!user}
                  isSaved={isAppliedProductCouponSaved}
                  isSaving={savingVoucherId === validatedProductCoupon.id}
                  onSave={handleSaveVoucher}
                  onRemove={() => handleRemoveCoupon('PRODUCT')}
                />
              )}
              {validatedShippingCoupon && (
                <CheckoutAppliedCouponCard
                  coupon={validatedShippingCoupon}
                  variant="shipping"
                  userLoggedIn={!!user}
                  isSaved={isAppliedShippingCouponSaved}
                  isSaving={savingVoucherId === validatedShippingCoupon.id}
                  onSave={handleSaveVoucher}
                  onRemove={() => handleRemoveCoupon('SHIPPING')}
                />
              )}
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/30">
            <div className="space-y-3.5 sm:space-y-4 text-md sm:text-[15px]">
              <div className="flex items-center justify-between gap-4">
                <span className="max-w-[58%] text-muted">{t('summary.subtotal')}</span>
                <span className="text-right font-semibold tabular-nums text-ink">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="max-w-[58%] text-muted">{t('summary.shippingFee')}</span>
                <span className="text-right font-semibold tabular-nums text-ink">
                  {formatPrice(shippingFee)}
                </span>
              </div>
              {productDiscount > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="max-w-[58%] text-muted">{t('summary.productDiscount')}</span>
                  <span className="text-right text-sm font-bold tracking-wide text-emerald-500 tabular-nums uppercase">-{formatPrice(productDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="max-w-[58%] text-muted">{t('summary.shippingDiscount')}</span>
                <span className={`text-right font-semibold tabular-nums ${shippingDiscount > 0 ? 'text-emerald-500' : 'text-muted'}`}>
                  {shippingDiscount > 0 ? `-${formatPrice(shippingDiscount)}` : formatPrice(0)}
                </span>
              </div>
              {taxAmount > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="max-w-[58%] text-muted">
                    {t('summary.vat', {
                      percent: taxConfig.taxPercent,
                      suffix: taxConfig.taxMode === 'INCLUDED' ? t('summary.vatIncluded') : '',
                    })}
                  </span>
                  <span className={`text-right font-semibold tabular-nums ${taxConfig.taxMode === 'EXCLUDED' ? 'text-ink' : 'text-muted'}`}>
                    {taxConfig.taxMode === 'EXCLUDED' ? '+' : ''}{formatPrice(taxAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/50 to-blue-50/60 p-4 sm:p-5 dark:border-blue-900/40 dark:from-slate-900 dark:via-blue-950/15 dark:to-blue-950/15">
            <div className="space-y-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink sm:text-xl">{t('summary.total')}</p>
                <p className="mt-1 max-w-[15rem] text-sm leading-snug text-muted">
                  {!taxConfig.enabled ? "" : taxConfig.taxMode === 'INCLUDED' ? t('summary.taxIncluded') : ""}
                </p>
              </div>
              <span className="block w-full text-right font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 text-[1.7rem] sm:text-[2rem] tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
            iconRight={!submitting ? <FiCheck className="text-xl" /> : undefined}
            fullWidth
            size="lg"
            className="h-14 sm:h-[58px] rounded-2xl font-bold text-base sm:text-lg"
          >
            {submitting ? t('summary.submitting') : t('summary.submit')}
          </Button>
        </SectionCard>
      </div>

      <Modal
        open={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title={t('voucherModal.title')}
        size="xl"
        scrollable
        footer={
          <ModalCancelButton onClick={() => setShowVoucherModal(false)}>
            {t('voucherModal.close')}
          </ModalCancelButton>
        }
      >
        <div className="space-y-5">
          <SectionCard
            title={t('voucherModal.manualTitle')}
            className="bg-slate-50/70 dark:bg-slate-800/30"
            titleClassName="text-md font-bold uppercase tracking-wide text-muted"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-md uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('voucherModal.manualPlaceholder')}
                value={inputCouponCode}
                onChange={(e) => {
                  setInputCouponCode(e.target.value.toUpperCase());
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <PrimaryButton onClick={handleApplyCoupon} className="h-10 px-4 w-full sm:w-auto">
                {t('voucherModal.check')}
              </PrimaryButton>
            </div>
            {(validatedProductCoupon || validatedShippingCoupon) && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 space-y-1">
                {validatedProductCoupon && <div>{t('voucherModal.appliedProduct', { code: validatedProductCoupon.code })}</div>}
                {validatedShippingCoupon && <div>{t('voucherModal.appliedShipping', { code: validatedShippingCoupon.code })}</div>}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title={
              publicVouchers.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setExpandPublic(prev => !prev)}
                  aria-expanded={expandPublic}
                  className="group -m-2 inline-flex max-w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <FiGift className="shrink-0 text-blue-600" />
                  <span className="shrink-0 whitespace-nowrap leading-none">
                    {t('voucherModal.publicTitle', { defaultValue: 'Kho voucher' })}
                  </span>
                  <span className="shrink-0 px-2 py-0.5 text-11 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {publicVouchers.length}
                  </span>
                  <FiChevronDown className={`shrink-0 text-lg text-subtle transition-transform group-hover:text-blue-600 ${expandPublic ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <FiGift className="shrink-0 text-blue-600" />
                  <span>{t('voucherModal.publicTitle', { defaultValue: 'Kho voucher' })}</span>
                  <span className="px-2 py-0.5 text-11 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {publicVouchers.length}
                  </span>
                </div>
              )
            }
            titleClassName="text-md font-bold uppercase tracking-wide text-muted"
          >
            {publicVouchers.length === 0 ? (
              <p className="text-md text-subtle">{t('voucherModal.noPublic')}</p>
            ) : (
              <div className="space-y-3">
                {getVisibleVouchers(publicVouchers, expandPublic).map(voucher => (
                  <CheckoutVoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    userLoggedIn={!!user}
                    isApplied={validatedProductCoupon?.id === voucher.id || validatedShippingCoupon?.id === voucher.id}
                    isSaved={savedCouponIds.includes(voucher.id) || !!voucher.saved}
                    isSaving={savingVoucherId === voucher.id}
                    onApply={handleApplyVoucherFromList}
                    onRemove={() => handleRemoveCoupon(getVoucherType(voucher) === 'FREESHIP' ? 'SHIPPING' : 'PRODUCT')}
                    onSave={handleSaveVoucher}
                    onUnsave={handleUnsaveVoucher}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title={
              savedVouchers.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setExpandSaved(prev => !prev)}
                  aria-expanded={expandSaved}
                  className="group -m-2 inline-flex max-w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <FiBookmark className="shrink-0 text-blue-600" />
                  <span className="shrink-0 whitespace-nowrap leading-none">
                    {t('voucherModal.savedTitle')}
                  </span>
                  <span className="shrink-0 px-2 py-0.5 text-11 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {savedVouchers.length}
                  </span>
                  <FiChevronDown className={`shrink-0 text-lg text-subtle transition-transform group-hover:text-blue-600 ${expandSaved ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <FiBookmark className="shrink-0 text-blue-600" />
                  <span>{t('voucherModal.savedTitle')}</span>
                  <span className="px-2 py-0.5 text-11 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {savedVouchers.length}
                  </span>
                </div>
              )
            }
            titleClassName="text-md font-bold uppercase tracking-wide text-muted"
          >
            {!user ? (
              <p className="text-md text-subtle">{t('voucherModal.loginToViewSaved')}</p>
            ) : savedVouchers.length === 0 ? (
              <p className="text-md text-subtle">{t('voucherModal.noSaved')}</p>
            ) : (
              <div className="space-y-3">
                {getVisibleVouchers(savedVouchers, expandSaved).map(voucher => (
                  <CheckoutVoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    userLoggedIn={!!user}
                    isApplied={validatedProductCoupon?.id === voucher.id || validatedShippingCoupon?.id === voucher.id}
                    isSaved={savedCouponIds.includes(voucher.id) || !!voucher.saved}
                    isSaving={savingVoucherId === voucher.id}
                    onApply={handleApplyVoucherFromList}
                    onRemove={() => handleRemoveCoupon(getVoucherType(voucher) === 'FREESHIP' ? 'SHIPPING' : 'PRODUCT')}
                    onSave={handleSaveVoucher}
                    onUnsave={handleUnsaveVoucher}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </Modal>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? t('address.form.editTitle') : t('address.form.addTitle')}
        size="xl"
        scrollable
        footer={
          <>
            <Button onClick={resetForm} variant="secondary" className="h-11 sm:h-14 px-5 sm:px-10 rounded-2xl font-bold text-md sm:text-lg">
              {t('address.form.cancel')}
            </Button>
            <Button onClick={handleSaveAddress} variant="primary" className="h-11 sm:h-14 px-5 sm:px-10 text-md sm:text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/30">
              {t('address.form.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-5 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-body uppercase tracking-wider">{t('address.form.fullName')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('address.form.fullNamePlaceholder')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-body uppercase tracking-wider">{t('address.form.phoneNumber')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('address.form.phoneNumberPlaceholder')} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-body uppercase tracking-wider">{t('address.form.province')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('address.form.provincePlaceholder')} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-body uppercase tracking-wider">{t('address.form.district')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('address.form.districtPlaceholder')} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-body uppercase tracking-wider">{t('address.form.ward')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('address.form.wardPlaceholder')} value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-md font-semibold text-body uppercase tracking-wider">{t('address.form.detailAddress')}</label>
            <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('address.form.detailAddressPlaceholder')} value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} />
          </div>

          <div className="pt-1 sm:pt-4">
            <label className="inline-flex items-center gap-3 sm:gap-4 cursor-pointer p-4 sm:p-5 rounded-2xl border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 shrink-0">
                <Checkbox
                  checked={form.isDefault || false}
                  onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px]"
                />
              </div>
              <div>
                <span className="text-md sm:text-lg font-bold text-body">{t('address.form.setDefault')}</span>
                <p className="text-sm sm:text-base text-muted mt-0.5">{t('address.form.setDefaultHint')}</p>
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
