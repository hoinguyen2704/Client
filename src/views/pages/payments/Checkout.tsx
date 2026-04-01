import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiTag, FiCheck, FiPlus, FiEdit2, FiBookmark } from 'react-icons/fi';
import { toast } from 'sonner';
import { Modal } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import cartService from '@/apis/services/cartService';
import addressService from '@/apis/services/addressService';
import couponService from '@/apis/services/couponService';
import userCouponService from '@/apis/services/userCouponService';
import orderService from '@/apis/services/orderService';
import type { CartResponse, AddressResponse, AddressRequest, CouponResponse } from '@/types';
import useAuthStore from '@/stores/useAuthStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState<CartResponse[]>([]);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<CouponResponse | null>(null);
  const [savedCouponIds, setSavedCouponIds] = useState<string[]>([]);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressRequest>({ fullName: '', phoneNumber: '', province: '', district: '', ward: '', detailAddress: '', isDefault: false });
  const [editId, setEditId] = useState<string | null>(null);

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

  useEffect(() => {
    const tasks: Promise<unknown>[] = [
      cartService.getMyCart().then(r => setCartItems(r.data || [])),
      addressService.getMyAddresses().then(r => {
        setAddresses(r.data || []);
        const def = (r.data || []).find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      }),
    ];

    if (user) {
      tasks.push(
        userCouponService.getMySavedCoupons()
          .then((r) => setSavedCouponIds((r.data || []).map((coupon) => coupon.id)))
          .catch(() => setSavedCouponIds([])),
      );
    } else {
      setSavedCouponIds([]);
    }

    Promise.all(tasks).finally(() => setLoading(false));
  }, [user]);

  const getErrorMessage = (err: any, fallback: string) =>
    err?.message || err?.error || err?.data?.message || fallback;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await couponService.validate(couponCode, subtotal);
      const coupon = res.data;
      setValidatedCoupon(coupon || null);
      if (coupon.discountType === 'PERCENTAGE') {
        let d = subtotal * coupon.discountValue / 100;
        if (coupon.maxDiscountAmount) d = Math.min(d, coupon.maxDiscountAmount);
        setDiscount(d);
      } else {
        setDiscount(coupon.discountValue);
      }
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Mã giảm giá không hợp lệ!'));
      setValidatedCoupon(null);
      setDiscount(0);
    }
  };

  const handleSaveAppliedCoupon = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu voucher');
      return;
    }
    if (!validatedCoupon?.id) return;

    setSavingCoupon(true);
    try {
      await userCouponService.saveCoupon(validatedCoupon.id);
      setSavedCouponIds((prev) => prev.includes(validatedCoupon.id) ? prev : [...prev, validatedCoupon.id]);
      toast.success('Đã lưu mã giảm giá vào ví voucher!');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Không thể lưu mã vào ví'));
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAddressId) { toast.warning('Vui lòng chọn địa chỉ giao hàng!'); return; }
    if (cartItems.length === 0) { toast.warning('Giỏ hàng trống!'); return; }
    setSubmitting(true);
    try {
      const res = await orderService.checkout({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: couponCode || undefined,
        note: note || undefined,
        items: cartItems.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      if (res.data?.paymentUrl) { window.location.href = res.data.paymentUrl; }
      else { 
        toast.success('Đặt hàng thành công!');
        navigate(`/user/orders/${res.data?.orderNumber}`); 
      }
    } catch { toast.error('Đặt hàng thất bại!'); }
    finally { setSubmitting(false); }
  };

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shippingFee - discount;
  const isAppliedCouponSaved = !!validatedCoupon?.id && savedCouponIds.includes(validatedCoupon.id);

  if (loading) return <div className="w-full max-w-[1440px] mx-auto px-4 py-12"><div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Thông tin thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Address */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><FiMapPin /> Địa chỉ giao hàng</h2>
              <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 group">
                <FiPlus className="group-hover:rotate-90 transition-transform" /> Thêm địa chỉ mới
              </button>
            </div>
            
            {addresses.length === 0 ? (
              <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-8 mb-4 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 relative z-10 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <FiMapPin className="text-2xl text-purple-500" />
                </div>
                <h3 className="text-lg font-bold mb-2 relative z-10 text-slate-800 dark:text-white">Bạn chưa có địa chỉ giao hàng nào</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm relative z-10">Vui lòng thêm địa chỉ để chúng tôi có thể giao hàng đến tận nơi cho bạn.</p>
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900/50 hover:border-purple-500 hover:text-purple-700 text-purple-600 dark:text-purple-400 font-semibold rounded-xl transition-all flex items-center gap-2 relative z-10 shadow-sm hover:shadow-md"
                >
                  <FiPlus />
                  Thêm địa chỉ ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-900/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-slate-800 dark:text-white">{addr.fullName}</span> 
                          <span className="text-slate-300 dark:text-slate-600">|</span> 
                          <span className="font-medium text-slate-600 dark:text-slate-400">{addr.phoneNumber}</span>
                          {addr.isDefault && <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 uppercase tracking-wide">Mặc định</span>}
                        </div>
                        <button type="button" onClick={(e) => { e.preventDefault(); handleEditAddress(addr); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Sửa địa chỉ"><FiEdit2 /></button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Sản phẩm ({cartItems.length})</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 rounded-lg object-cover bg-slate-50" /> : <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.productName}</h4>
                    <p className="text-sm text-slate-500">{item.variantName} | x{item.quantity}</p>
                  </div>
                  <span className="font-bold text-purple-600">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Phương thức thanh toán</h2>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: 'COD', label: 'Thanh toán khi nhận hàng' }, { id: 'VNPAY', label: 'VNPay' }, { id: 'MOMO', label: 'MoMo' }, { id: 'BANK_TRANSFER', label: 'Chuyển khoản' }].map(pm => (
                <label key={pm.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === pm.id ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                  <span className="font-medium text-sm">{pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">Ghi chú</h2>
            <textarea className="w-full h-20 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none" placeholder="Ghi chú cho đơn hàng..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 h-fit sticky top-28 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-4">Tóm tắt đơn hàng</h2>
          <div className="flex gap-2">
            <input className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm uppercase focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:font-sans" placeholder="Mã giảm giá" value={couponCode} onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setValidatedCoupon(null);
            }} />
            <button onClick={handleApplyCoupon} className="px-5 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"><FiTag className="text-lg" /></button>
          </div>
          {validatedCoupon && (
            <div className="flex items-center justify-between gap-3 text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">
                Mã <strong className="font-mono">{validatedCoupon.code}</strong> đã áp dụng.
              </span>
              {user ? (
                isAppliedCouponSaved ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đã lưu trong ví</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveAppliedCoupon}
                    disabled={savingCoupon}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60"
                  >
                    <FiBookmark className="text-sm" />
                    {savingCoupon ? 'Đang lưu...' : 'Lưu vào ví'}
                  </button>
                )
              ) : (
                <span className="text-slate-400">Đăng nhập để lưu mã</span>
              )}
            </div>
          )}
          <div className="space-y-4 text-[15px]">
            <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phí vận chuyển</span><span className="font-medium">{shippingFee === 0 ? <span className="text-emerald-500 font-bold tracking-wide uppercase text-xs">Miễn phí</span> : formatPrice(shippingFee)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Giảm giá</span><span className="text-emerald-500 font-bold tracking-wide uppercase text-xs">-{formatPrice(discount)}</span></div>}
            <hr className="border-slate-100 dark:border-slate-800" />
            <div className="flex justify-between text-xl items-end"><span className="font-bold">Tổng thanh toán</span><span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 leading-none">{formatPrice(total)}</span></div>
            <p className="text-right text-xs text-slate-400 mt-1">(Đã bao gồm VAT nếu có)</p>
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed">
            {submitting ? 'Đang xử lý...' : <><span className="text-lg">Xác nhận Đặt hàng</span> <FiCheck className="text-xl" /></>}
          </button>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? 'Sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
        size="xl"
        scrollable
        footer={
          <>
            <button onClick={resetForm} className="px-10 py-4 rounded-2xl font-bold text-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Hủy bỏ</button>
            <button onClick={handleSaveAddress} className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/30 transform hover:-translate-y-1">
              Lưu địa chỉ
            </button>
          </>
        }
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Họ và tên người nhận</label>
              <input className="w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-lg" placeholder="Nhập họ và tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Số điện thoại liên hệ</label>
              <input className="w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-lg" placeholder="Nhập số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tỉnh/Thành phố</label>
              <input className="w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-lg" placeholder="Ví dụ: TP. Hồ Chí Minh" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quận/Huyện</label>
              <input className="w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-lg" placeholder="Ví dụ: Quận 1" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phường/Xã</label>
              <input className="w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-lg" placeholder="Ví dụ: Phường Bến Nghé" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Địa chỉ cụ thể (Số nhà, tên đường)</label>
            <input className="w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-lg" placeholder="Ví dụ: 123 Đường Nguyễn Hữu Cảnh" value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} />
          </div>

          <div className="pt-4">
            <label className="inline-flex items-center gap-4 cursor-pointer p-5 rounded-2xl border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                <input type="checkbox" checked={form.isDefault || false} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="peer appearance-none w-7 h-7 rounded-[8px] border-2 border-slate-300 dark:border-slate-600 checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer" />
                <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3] text-lg" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Đặt làm địa chỉ mặc định</span>
                <p className="text-base text-slate-500 mt-0.5">Chúng tôi sẽ dùng địa chỉ này ưu tiên cho các đơn hàng tiếp theo của bạn.</p>
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
