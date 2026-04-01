import { useState, useEffect } from 'react';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import cartService from '@/apis/services/cartService';
import useCartStore from '@/stores/useCartStore';
import type { CartResponse } from '@/types';

export default function Cart() {
  const [items, setItems] = useState<(CartResponse & { selected: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const syncFromServer = useCartStore((s) => s.syncFromServer);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    try { const res = await cartService.getMyCart(); setItems((res.data || []).map(i => ({ ...i, selected: true }))); }
    catch { setItems([]); }
    finally { setLoading(false); syncFromServer(); }
  };

  const handleUpdateQty = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await cartService.updateQuantity(itemId, qty);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty, subtotal: i.price * qty } : i));
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

  const toggleSelect = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  const toggleAll = () => { const all = items.every(i => i.selected); setItems(prev => prev.map(i => ({ ...i, selected: !all }))); };

  const selectedItems = items.filter(i => i.selected);
  const total = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Giỏ hàng của bạn <span className="text-slate-400 font-medium text-xl ml-2">({items.length} sản phẩm)</span></h1>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <FiShoppingBag className="text-6xl text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Giỏ hàng trống</h3>
          <p className="text-slate-500 mb-8 max-w-sm">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ. Khám phá hàng ngàn deal hot ngay hôm nay!</p>
          <Link to="/search" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1">
            MUA SẮM NGAY
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={items.every(i => i.selected)} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300" />
                <span className="font-medium text-sm">Chọn tất cả ({items.length})</span>
              </label>
              <button onClick={handleClearCart} className="text-sm text-red-500 hover:underline">Xóa tất cả</button>
            </div>

            {items.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded border-slate-300 shrink-0" />
                <Link to={`/product/${item.productSlug}`} className="shrink-0 group block">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 object-cover rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent group-hover:border-purple-300 transition-colors" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 transition-colors"><FiShoppingBag /></div>
                  )}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col items-start">
                  <Link to={`/product/${item.productSlug}`} className="hover:text-purple-600 transition-colors w-full">
                    <h3 className="font-bold line-clamp-1">{item.productName}</h3>
                  </Link>
                  <Link to={`/product/${item.productSlug}`} className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-0.5 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer" title="Nhấn để đổi cấu hình khác">
                    <p className="text-sm font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">{item.variantName}</p>
                    <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded">Thay đổi</span>
                  </Link>
                  <p className="text-purple-600 font-bold mt-1.5">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"><FiMinus /></button>
                  <span className="w-10 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"><FiPlus /></button>
                </div>
                <button onClick={() => handleRemove(item.id)} className="p-2 text-slate-400 hover:text-red-500 shrink-0"><FiTrash2 /></button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 h-fit sticky top-28 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4 text-[15px]">
              <div className="flex justify-between"><span className="text-slate-500">Sản phẩm đã chọn</span><span className="font-medium">{selectedItems.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span className="font-medium">{formatPrice(total)}</span></div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex justify-between text-lg"><span className="font-bold">Tổng cộng</span><span className="font-bold text-purple-600">{formatPrice(total)}</span></div>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg w-full text-center block">
              Thanh toán ({selectedItems.length})
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
