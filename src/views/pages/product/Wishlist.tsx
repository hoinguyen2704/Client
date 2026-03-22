import { useState, useEffect } from 'react';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/helpers/format';
import wishlistService from '@/apis/services/wishlistService';
import cartService from '@/apis/services/cartService';
import type { WishlistResponse } from '@/types';

export default function Wishlist() {
  const [items, setItems] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try { const res = await wishlistService.getMyWishlist(1, 50); setItems(res.data?.data || []); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };

  const handleRemove = async (productId: string) => {
    try { await wishlistService.remove(productId); setItems(prev => prev.filter(i => i.productId !== productId)); }
    catch { alert('Xóa thất bại!'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách yêu thích</h1>
        <span className="text-sm text-slate-500">{items.length} sản phẩm</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <FiHeart className="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm yêu thích</h3>
          <p className="text-slate-500 mb-6">Nhấn vào biểu tượng trái tim trên sản phẩm để thêm vào danh sách.</p>
          <Link to="/search" className="btn btn-primary btn-lg">Khám phá sản phẩm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
              <Link to={`/product/${item.productSlug}`} className="block aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
                {item.productThumbnailUrl ? (
                  <img src={item.productThumbnailUrl} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><FiShoppingCart className="text-4xl" /></div>
                )}
              </Link>
              <div className="p-4">
                <Link to={`/product/${item.productSlug}`} className="font-bold line-clamp-2 hover:text-purple-600 transition-colors mb-2">{item.productName}</Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-purple-600">{formatPrice(item.productPrice)}</span>
                  {item.productCompareAtPrice && item.productCompareAtPrice > item.productPrice && (
                    <span className="text-sm text-slate-400 line-through">{formatPrice(item.productCompareAtPrice)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRemove(item.productId)} className="flex-1 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                    <FiTrash2 /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
