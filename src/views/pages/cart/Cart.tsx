import { useState, useEffect } from 'react';
import { FiTrash2, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import cartService from '@/apis/services/cartService';
import useCartStore from '@/stores/useCartStore';
import { Button, Checkbox, IconButton, PrimaryButton, QuantitySelector } from '@/components';
import type { CartResponse } from '@/types';

export default function Cart() {
  const [items, setItems] = useState<(CartResponse & { selected: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartService.getMyCart();
      setItems((res.data || []).map(i => ({
        ...i,
        selected: i.available !== false,
      })));
    }
    catch { setItems([]); }
    finally { setLoading(false); }
  };

  const handleUpdateQty = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    const target = items.find(i => i.id === itemId);
    if (target?.available === false) {
      toast.warning(target.issueMessage || 'Sản phẩm hiện không còn khả dụng');
      return;
    }
    try {
      const res = await cartService.updateQuantity(itemId, qty);
      setItems(prev => prev.map(i => i.id === itemId ? {
        ...i,
        ...res.data,
        selected: res.data.available === false ? false : i.selected,
      } : i));
      syncFromServer();
    } catch { toast.error('Cập nhật số lượng thất bại!'); }
  };

  const handleRemove = async (itemId: string) => {
    try { 
      await cartService.removeItem(itemId); 
      setItems(prev => prev.filter(i => i.id !== itemId)); 
      syncFromServer();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch { toast.error('Xóa sản phẩm thất bại!'); }
  };

  const handleClearCart = async () => {
    toast('Xác nhận xóa toàn bộ giỏ hàng?', {
      icon: <FiInfo className="text-blue-500" />,
      action: {
        label: 'Xóa Tất Cả',
        onClick: async () => {
          try { 
            await cartService.clearCart(); 
            setItems([]); 
            syncFromServer();
            toast.success('Đã xóa toàn bộ giỏ hàng');
          } catch { toast.error('Thao tác thất bại!'); }
        }
      },
    });
  };

  const toggleSelect = (id: string) => setItems(prev => prev.map(i => {
    if (i.id !== id) return i;
    if (i.available === false) return i;
    return { ...i, selected: !i.selected };
  }));
  const toggleAll = () => {
    const selectable = items.filter(i => i.available !== false);
    const all = selectable.length > 0 && selectable.every(i => i.selected);
    setItems(prev => prev.map(i => (i.available === false ? i : { ...i, selected: !all })));
  };

  const selectableItems = items.filter(i => i.available !== false);
  const allSelectableSelected = selectableItems.length > 0 && selectableItems.every(i => i.selected);
  const selectedItems = items.filter(i => i.selected && i.available !== false);
  const total = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 md:py-12 space-y-5 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1 sm:mb-2">
        Giỏ hàng của bạn <span className="text-slate-400 font-medium text-base sm:text-xl ml-1 sm:ml-2">({items.length} sản phẩm)</span>
      </h1>

      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 sm:h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl sm:rounded-3xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <FiShoppingBag className="text-5xl sm:text-6xl text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-slate-800 dark:text-white">Giỏ hàng trống</h3>
          <p className="text-md sm:text-base text-slate-500 mb-6 sm:mb-8 max-w-sm">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ. Khám phá hàng ngàn deal hot ngay hôm nay!</p>
          <Link to="/search" className="px-6 sm:px-8 py-3.5 sm:py-4 text-md sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1">
            MUA SẮM NGAY
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          <div className="lg:col-span-8 space-y-3 sm:space-y-6">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={allSelectableSelected} onCheckedChange={() => toggleAll()} className="w-4 h-4" />
                <span className="font-medium text-md">Chọn tất cả ({items.length})</span>
              </label>
              <Button onClick={handleClearCart} variant="ghost" size="lg" icon={<FiTrash2 />} className="text-red-500 shrink-0">Xóa tất cả</Button>
            </div>

            {items.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-start gap-3 sm:flex-1 sm:min-w-0">
                  <span className="mt-1 shrink-0">
                    <Checkbox
                      checked={item.selected}
                      disabled={item.available === false}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="w-4 h-4"
                      aria-label={item.productName}
                    />
                  </span>
                  <Link to={`/product/${item.productSlug}`} className="shrink-0 group block">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent group-hover:border-purple-300 transition-colors" />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 transition-colors"><FiShoppingBag /></div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1 flex flex-col items-start">
                    <Link to={`/product/${item.productSlug}`} className="hover:text-purple-600 transition-colors w-full">
                      <h3 className="font-bold line-clamp-2 text-md sm:text-base">{item.productName}</h3>
                    </Link>
                    <Link to={`/product/${item.productSlug}`} className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-0.5 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer" title="Nhấn để đổi cấu hình khác">
                      <p className="text-sm sm:text-md font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 line-clamp-1">{item.variantName}</p>
                      <span className="text-10 font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded">Thay đổi</span>
                    </Link>
                    <p className="text-purple-600 font-bold mt-1 text-md sm:text-base">{formatPrice(item.price)}</p>
                    {item.available === false && (
                      <p className="text-sm text-red-500 mt-1">{item.issueMessage || 'Sản phẩm không còn khả dụng'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 pl-7 sm:pl-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(val) => handleUpdateQty(item.id, val)}
                      min={1}
                      size="md"
                      disabled={item.available === false}
                    />
                  </div>
                  <IconButton onClick={() => handleRemove(item.id)} variant="ghost" size="lg" icon={<FiTrash2 className="text-lg" />} className="text-slate-400 hover:text-red-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 dark:border-slate-800 h-fit sticky top-24 sm:top-28 space-y-4 sm:space-y-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 sm:space-y-4 text-md sm:text-15">
              <div className="flex justify-between"><span className="text-slate-500">Sản phẩm đã chọn</span><span className="font-medium">{selectedItems.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span className="font-medium">{formatPrice(total)}</span></div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between text-base sm:text-lg"><span className="font-bold">Tổng cộng</span><span className="font-bold text-purple-600">{formatPrice(total)}</span></div>
            </div>
            <PrimaryButton 
              onClick={() => {
                if (selectedItems.length === 0) {
                  toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
                  return;
                }
                navigate('/checkout', { state: { selectedCartItems: selectedItems } });
              }}
              disabled={selectedItems.length === 0}
              className={`w-full !h-12 sm:!h-14 !text-base sm:!text-lg !rounded-2xl mt-3 sm:mt-4 ${selectedItems.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              Thanh toán ({selectedItems.length})
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
