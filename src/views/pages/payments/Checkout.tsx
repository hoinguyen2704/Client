import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMapPin, FiTag, FiCheck, FiPlus, FiEdit2, FiBookmark, FiGift, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'sonner';
import { Button, Checkbox, IconButton, Modal, ModalCancelButton, PrimaryButton, Radio, TrashButton } from '@/components';
import { formatPrice } from '@/utils/format';
import cartService from '@/apis/services/cartService';
import addressService from '@/apis/services/addressService';
import couponService from '@/apis/services/couponService';
import userCouponService from '@/apis/services/userCouponService';
import orderService from '@/apis/services/orderService';
import settingService from '@/apis/services/settingService';
import type { CartResponse, AddressResponse, AddressRequest, CouponResponse, PaymentMethodConfig, ShippingConfig, TaxConfig } from '@/types';
import useAuthStore from '@/stores/useAuthStore';

const createCheckoutIdempotencyKey = () => {
  if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const buyNowItem = location.state?.buyNowItem;
  const selectedCartItems = location.state?.selectedCartItems;
  
  const [cartItems, setCartItems] = useState<CartResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [productCouponCode, setProductCouponCode] = useState('');
  const [shippingCouponCode, setShippingCouponCode] = useState('');
  const [validatedProductCoupon, setValidatedProductCoupon] = useState<CouponResponse | null>(null);
  const [validatedShippingCoupon, setValidatedShippingCoupon] = useState<CouponResponse | null>(null);
  const [savedCouponIds, setSavedCouponIds] = useState<string[]>([]);
  const [savingCoupon, setSavingCoupon] = useState(false);
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
      toast.success('Đã lưu địa chỉ giao hàng!');
    } catch { toast.error('Lưu địa chỉ thất bại!'); }
  };

  const handleEditAddress = (addr: AddressResponse) => {
    setEditId(addr.id);
    setForm({ fullName: addr.fullName, phoneNumber: addr.phoneNumber, province: addr.province, district: addr.district, ward: addr.ward, detailAddress: addr.detailAddress, isDefault: addr.isDefault });
    setShowForm(true);
  };

  const loadCartData = async (forceServer = false) => {
    if (buyNowItem && !forceServer) {
      setCartItems([{
        id: 'buy-now',
        productId: buyNowItem.productId,
        variantId: buyNowItem.variantId,
        productName: buyNowItem.name,
        imageUrl: buyNowItem.image,
        price: buyNowItem.price,
        quantity: buyNowItem.quantity,
        subtotal: buyNowItem.price * buyNowItem.quantity,
        variantName: buyNowItem.variantName,
        productSlug: '',
        stockQuantity: 999
      } as unknown as CartResponse]);
    } else if (!forceServer && selectedCartItems && selectedCartItems.length > 0) {
      setCartItems(selectedCartItems);
    } else {
      const r = await cartService.getMyCart();
      setCartItems(r.data || []);
    }
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
      settingService.getShipping().then(res => { if (res.data) setShippingConfig(res.data); }).catch(() => {}),
      settingService.getTax().then(res => { if (res.data) setTaxConfig(res.data); }).catch(() => {}),
      settingService.getPaymentMethods().then(res => {
        if (res.data) {
          setPaymentMethods(res.data.filter(pm => pm.enabled));
          const first = res.data.find(pm => pm.enabled);
          if (first) setPaymentMethod(first.id);
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  const getErrorMessage = (err: any, fallback: string) =>
    err?.message || err?.error || err?.data?.message || fallback;
  const getErrorCode = (err: any) =>
    err?.errorCode || err?.data?.errorCode;

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
    toast.success('Đã bỏ áp dụng mã giảm giá');
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

      toast.success('Áp dụng mã giảm giá thành công!');
      return true;
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Mã giảm giá không hợp lệ!'));
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
      toast.error('Vui lòng đăng nhập để lưu voucher');
      return;
    }
    setSavingVoucherId(voucher.id);
    try {
      await userCouponService.saveCoupon(voucher.id);
      setSavedCouponIds(prev => prev.includes(voucher.id) ? prev : [...prev, voucher.id]);
      setPublicVouchers(prev => prev.map(v => v.id === voucher.id ? { ...v, saved: true } : v));
      setSavedVouchers(prev => prev.some(v => v.id === voucher.id) ? prev : [{ ...voucher, saved: true }, ...prev]);
      toast.success('Đã lưu voucher vào ví');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Không thể lưu voucher'));
    } finally {
      setSavingVoucherId(null);
    }
  };

  const handleUnsaveVoucher = async (voucherId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để quản lý voucher');
      return;
    }
    setSavingVoucherId(voucherId);
    try {
      await userCouponService.unsaveCoupon(voucherId);
      setSavedCouponIds(prev => prev.filter(id => id !== voucherId));
      setSavedVouchers(prev => prev.filter(v => v.id !== voucherId));
      setPublicVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, saved: false } : v));
      if (validatedProductCoupon?.id === voucherId) {
        setValidatedProductCoupon(prev => prev ? { ...prev, saved: false } : prev);
      }
      if (validatedShippingCoupon?.id === voucherId) {
        setValidatedShippingCoupon(prev => prev ? { ...prev, saved: false } : prev);
      }
      toast.success('Đã bỏ lưu voucher');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Không thể bỏ lưu voucher'));
    } finally {
      setSavingVoucherId(null);
    }
  };

  const handleSaveAppliedCoupon = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu voucher');
      return;
    }
    if (!validatedProductCoupon && !validatedShippingCoupon) return;

    setSavingCoupon(true);
    try {
      if (validatedProductCoupon) {
        await handleSaveVoucher(validatedProductCoupon);
      }
      if (validatedShippingCoupon) {
        await handleSaveVoucher(validatedShippingCoupon);
      }
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAddressId) { toast.warning('Vui lòng chọn địa chỉ giao hàng!'); return; }
    if (cartItems.length === 0) { toast.warning('Giỏ hàng trống!'); return; }
    if (cartItems.some(item => item.available === false)) {
      toast.warning('Có sản phẩm trong giỏ không còn khả dụng. Vui lòng cập nhật lại giỏ hàng.');
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
      if (res.data?.paymentUrl) { window.location.href = res.data.paymentUrl; }
      else { 
        toast.success('Đặt hàng thành công!');
        navigate(`/user/orders/${res.data?.orderNumber}`); 
      }
    } catch (err: any) {
      const errorCode = getErrorCode(err);
      toast.error(getErrorMessage(err, 'Đặt hàng thất bại!'));
      if ([
        'PRICE_CHANGED',
        'INSUFFICIENT_STOCK',
        'PRODUCT_NOT_AVAILABLE',
        'VARIANT_NOT_AVAILABLE',
      ].includes(errorCode)) {
        await loadCartData(true);
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

  const VoucherOptionCard = ({ voucher }: { voucher: CouponResponse }) => {
    const isSaved = savedCouponIds.includes(voucher.id) || !!voucher.saved;
    const voucherType = getVoucherType(voucher);

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold">{voucher.code}</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${voucherType === 'FREESHIP'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                }`}>
                {voucherType === 'FREESHIP' ? 'Freeship' : 'Giảm giá SP'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
              {voucher.discountType === 'PERCENTAGE'
                ? `Giảm ${voucher.discountValue}%`
                : `Giảm ${formatPrice(voucher.discountValue)}`}
            </p>
            {voucher.minOrderValue && (
              <p className="text-xs text-slate-500 mt-1">Đơn tối thiểu {formatPrice(voucher.minOrderValue)}</p>
            )}
          </div>
            {(validatedProductCoupon?.id === voucher.id || validatedShippingCoupon?.id === voucher.id) ? (
              <PrimaryButton
                onClick={() => handleRemoveCoupon(voucherType === 'FREESHIP' ? 'SHIPPING' : 'PRODUCT')}
                variant="outline"
                className="h-8 px-3 text-xs shadow-none shrink-0"
              >
                Bỏ áp dụng
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => handleApplyVoucherFromList(voucher)}
                className="h-8 px-3 text-xs shadow-none hover:translate-y-0 shrink-0"
              >
                Áp dụng
              </PrimaryButton>
            )}
        </div>
        <div className="flex justify-end">
          {user ? (
            isSaved ? (
              <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                Đã lưu
                <TrashButton
                  onClick={() => handleUnsaveVoucher(voucher.id)}
                  disabled={savingVoucherId === voucher.id}
                  title="Bỏ lưu mã"
                  className="w-7 h-7 rounded-lg"
                />
              </div>
            ) : (
              <PrimaryButton
                onClick={() => handleSaveVoucher(voucher)}
                disabled={savingVoucherId === voucher.id}
                variant="outline"
                className="h-8 px-3 text-xs shadow-none"
              >
                {savingVoucherId === voucher.id ? 'Đang lưu...' : 'Lưu vào ví'}
              </PrimaryButton>
            )
          ) : (
            <span className="text-xs text-slate-400">Đăng nhập để lưu mã</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 py-8 sm:py-12"><div className="h-80 sm:h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 md:py-12 space-y-5 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1 sm:mb-2">Thông tin thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
        <div className="lg:col-span-8 space-y-4 sm:space-y-8">
          {/* Address */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><FiMapPin /> Địa chỉ giao hàng</h2>
              <Button
                type="button"
                onClick={() => { resetForm(); setShowForm(true); }}
                variant="ghost"
                size="sm"
                icon={<FiPlus className="group-hover:rotate-90 transition-transform" />}
                className="group w-full sm:w-auto justify-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700"
              >
                Thêm địa chỉ mới
              </Button>
            </div>
            
            {addresses.length === 0 ? (
              <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-5 sm:p-8 mb-2 sm:mb-4 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 relative z-10 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <FiMapPin className="text-xl sm:text-2xl text-purple-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2 relative z-10 text-slate-800 dark:text-white">Bạn chưa có địa chỉ giao hàng nào</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm relative z-10">Vui lòng thêm địa chỉ để chúng tôi có thể giao hàng đến tận nơi cho bạn.</p>
                <Button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(true); }}
                  variant="outline"
                  size="sm"
                  icon={<FiPlus />}
                  className="px-6 border-purple-100 dark:border-purple-900/50 hover:border-purple-500 hover:text-purple-700 text-purple-600 dark:text-purple-400 relative z-10 shadow-sm hover:shadow-md"
                >
                  Thêm địa chỉ ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-[44vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-900/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <Radio
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onCheckedChange={(checked) => checked && setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">{addr.fullName}</span>
                          <span className="text-slate-300 dark:text-slate-600">|</span> 
                          <span className="font-medium text-sm sm:text-base text-slate-600 dark:text-slate-400">{addr.phoneNumber}</span>
                          {addr.isDefault && <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 uppercase tracking-wide">Mặc định</span>}
                        </div>
                        <IconButton
                          onClick={() => handleEditAddress(addr)}
                          icon={<FiEdit2 />}
                          title="Sửa địa chỉ"
                          variant="ghost"
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Sản phẩm ({cartItems.length})</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 sm:gap-4">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-slate-50" /> : <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-100 dark:bg-slate-800" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{item.productName}</h4>
                    <p className="text-xs sm:text-sm text-slate-500">{item.variantName} | x{item.quantity}</p>
                    {item.available === false && (
                      <p className="text-xs text-red-500 mt-1">{item.issueMessage || 'Sản phẩm không còn khả dụng'}</p>
                    )}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-purple-600 shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Phương thức thanh toán</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {paymentMethods.map(pm => (
                <label key={pm.id} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === pm.id ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                  <Radio
                    name="payment"
                    checked={paymentMethod === pm.id}
                    onCheckedChange={(checked) => checked && setPaymentMethod(pm.id)}
                  />
                  <span className="font-medium text-sm">{pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Ghi chú</h2>
            <textarea className="w-full h-24 sm:h-20 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none text-sm sm:text-base" placeholder="Ghi chú cho đơn hàng..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 dark:border-slate-800 h-fit sticky top-24 sm:top-28 space-y-4 sm:space-y-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">Tóm tắt đơn hàng</h2>
          <div className="flex gap-2">
            <input className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm uppercase focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:font-sans" placeholder="Mã giảm giá" value={inputCouponCode} onChange={(e) => {
              setInputCouponCode(e.target.value.toUpperCase());
            }} />
            <IconButton
              onClick={handleApplyCoupon}
              icon={<FiTag className="text-lg" />}
              variant="ghost"
              className="w-11 h-11 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
              title="Áp dụng mã giảm giá"
            />
          </div>
          <PrimaryButton
            onClick={() => setShowVoucherModal(true)}
            variant="outline"
            icon={<FiGift />}
            className="w-full h-10 text-sm"
          >
            Chọn từ kho voucher
          </PrimaryButton>
          {(validatedProductCoupon || validatedShippingCoupon) && (
            <div className="space-y-2">
              {validatedProductCoupon && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm p-3 rounded-xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                   <div className="flex flex-col">
                      <span className="text-xs text-purple-600 font-bold">Voucher Sản Phẩm</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Mã <strong className="font-mono">{validatedProductCoupon.code}</strong> đã áp dụng.
                      </span>
                   </div>
                  {user ? (
                    <div className="flex items-center gap-2">
                    {isAppliedProductCouponSaved ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đã lưu trong ví</span>
                    ) : validatedProductCoupon.isPublic ? (
                      <Button
                        type="button"
                        onClick={() => handleSaveVoucher(validatedProductCoupon)}
                        disabled={savingVoucherId === validatedProductCoupon.id}
                        size="sm"
                        icon={<FiBookmark className="text-sm" />}
                        className="h-8 px-3 rounded-lg from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700"
                      >
                        Lưu vào ví
                      </Button>
                    ) : null}
                      <IconButton
                        onClick={() => handleRemoveCoupon('PRODUCT')}
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        title="Bỏ áp dụng"
                        variant="ghost"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400">Đăng nhập để lưu mã</span>
                  )}
                </div>
              )}
              {validatedShippingCoupon && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex flex-col">
                      <span className="text-xs text-blue-600 font-bold">Voucher Freeship</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Mã <strong className="font-mono">{validatedShippingCoupon.code}</strong> đã áp dụng.
                      </span>
                  </div>
                  {user ? (
                    <div className="flex items-center gap-2">
                    {isAppliedShippingCouponSaved ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đã lưu trong ví</span>
                    ) : validatedShippingCoupon.isPublic ? (
                      <Button
                        type="button"
                        onClick={() => handleSaveVoucher(validatedShippingCoupon)}
                        disabled={savingVoucherId === validatedShippingCoupon.id}
                        size="sm"
                        icon={<FiBookmark className="text-sm" />}
                        className="h-8 px-3 rounded-lg from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                      >
                        Lưu vào ví
                      </Button>
                    ) : null}
                      <IconButton
                        onClick={() => handleRemoveCoupon('SHIPPING')}
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        className="w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        title="Bỏ áp dụng"
                        variant="ghost"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400">Đăng nhập để lưu mã</span>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-[15px]">
            <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phí vận chuyển</span><span className="font-medium">{shippingFee === 0 ? <span className="text-emerald-500 font-bold tracking-wide uppercase text-xs">Miễn phí</span> : formatPrice(shippingFee)}</span></div>
            {productDiscount > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm giá sản phẩm</span><span className="text-emerald-500 font-bold tracking-wide uppercase text-xs">-{formatPrice(productDiscount)}</span></div>}
            {shippingDiscount > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm phí vận chuyển</span><span className="text-emerald-500 font-bold tracking-wide uppercase text-xs">-{formatPrice(shippingDiscount)}</span></div>}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Thuế VAT ({taxConfig.taxPercent}%{taxConfig.taxMode === 'INCLUDED' ? ', đã gồm' : ''})
                </span>
                <span className={`font-medium ${taxConfig.taxMode === 'EXCLUDED' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  {taxConfig.taxMode === 'EXCLUDED' ? '+' : ''}{formatPrice(taxAmount)}
                </span>
              </div>
            )}
            <hr className="border-slate-100 dark:border-slate-800" />
            <div className="flex justify-between text-base sm:text-xl items-end"><span className="font-bold">Tổng thanh toán</span><span className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 leading-none">{formatPrice(total)}</span></div>
            <p className="text-right text-xs text-slate-400 mt-1">
              {!taxConfig.enabled
                ? '(Thuế hiện đang tắt theo cấu hình cửa hàng)'
                : taxConfig.taxMode === 'INCLUDED'
                  ? '(Thuế đã bao gồm trong tổng thanh toán)'
                  : '(Thuế được cộng thêm theo cấu hình cửa hàng)'}
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
            iconRight={!submitting ? <FiCheck className="text-xl" /> : undefined}
            fullWidth
            size="lg"
            className="h-12 sm:h-14 rounded-2xl font-bold text-base sm:text-lg"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
          </Button>
        </div>
      </div>

      <Modal
        open={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title="Chọn voucher"
        size="xl"
        scrollable
        footer={
          <ModalCancelButton onClick={() => setShowVoucherModal(false)}>
            Đóng
          </ModalCancelButton>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/30 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Nhập mã</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm uppercase focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Nhập mã giảm giá"
                value={inputCouponCode}
                onChange={(e) => {
                  setInputCouponCode(e.target.value.toUpperCase());
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <PrimaryButton onClick={handleApplyCoupon} className="h-10 px-4 w-full sm:w-auto">
                Kiểm tra
              </PrimaryButton>
            </div>
            {(validatedProductCoupon || validatedShippingCoupon) && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                 {validatedProductCoupon && <div>Mã sản phẩm <span className="font-mono font-bold">{validatedProductCoupon.code}</span> đã được áp dụng.</div>}
                 {validatedShippingCoupon && <div>Mã freeship <span className="font-mono font-bold">{validatedShippingCoupon.code}</span> đã được áp dụng.</div>}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiGift className="text-purple-600" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Kho voucher</h3>
                <span className="px-2 py-0.5 text-[11px] rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {publicVouchers.length}
                </span>
              </div>
              {publicVouchers.length > 1 && (
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
            {publicVouchers.length === 0 ? (
              <p className="text-sm text-slate-400">Hiện chưa có voucher public.</p>
            ) : (
              <div className="space-y-3">
                {getVisibleVouchers(publicVouchers, expandPublic).map(voucher => (
                  <VoucherOptionCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiBookmark className="text-purple-600" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Mã đã lưu</h3>
                <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {savedVouchers.length}
                </span>
              </div>
              {savedVouchers.length > 1 && (
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
              <p className="text-sm text-slate-400">Đăng nhập để xem mã đã lưu.</p>
            ) : savedVouchers.length === 0 ? (
              <p className="text-sm text-slate-400">Bạn chưa lưu voucher nào.</p>
            ) : (
              <div className="space-y-3">
                {getVisibleVouchers(savedVouchers, expandSaved).map(voucher => (
                  <VoucherOptionCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? 'Sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
        size="xl"
        scrollable
        footer={
          <>
            <Button onClick={resetForm} variant="secondary" className="h-11 sm:h-14 px-5 sm:px-10 rounded-2xl font-bold text-sm sm:text-lg">
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveAddress} variant="primary" className="h-11 sm:h-14 px-5 sm:px-10 text-sm sm:text-lg font-bold rounded-2xl shadow-xl shadow-purple-500/30">
              Lưu địa chỉ
            </Button>
          </>
        }
      >
        <div className="space-y-5 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Họ và tên người nhận</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Nhập họ và tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Số điện thoại liên hệ</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Nhập số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tỉnh/Thành phố</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: Hà Nội" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quận/Huyện</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: Cầu Giấy" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phường/Xã</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: Dịch Vọng Hậu" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Địa chỉ cụ thể (Số nhà, tên đường)</label>
            <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: 123 Xuân Thủy" value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} />
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
                <span className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-200">Đặt làm địa chỉ mặc định</span>
                <p className="text-xs sm:text-base text-slate-500 mt-0.5">Chúng tôi sẽ dùng địa chỉ này ưu tiên cho các đơn hàng tiếp theo của bạn.</p>
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
