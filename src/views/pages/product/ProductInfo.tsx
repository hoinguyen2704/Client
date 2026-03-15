import { useState } from 'react';
import { FiStar, FiHeart, FiShoppingCart, FiCheck, FiPlus, FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/helpers/format';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
  discount: number;
  category: string;
  brand: string;
  isNew?: boolean;
  isFlashSale?: boolean;
  specs?: Record<string, string>;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('8GB');
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Đen');

  const variants = ['8GB', '16GB', '32GB'];
  const storages = ['128GB', '256GB', '512GB', '1TB'];
  const colors = ['Đen', 'Trắng', 'Xám', 'Xanh'];

  const handleAddToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm ${product.name} (${selectedVariant}, ${selectedStorage}, ${selectedColor}) vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        buyNowItem: {
          ...product,
          quantity: Number(quantity) || 1,
          selectedVariant,
          selectedStorage,
          selectedColor,
        },
      },
    });
  };

  return (
    <div className="w-full lg:w-7/12 flex flex-col">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1 text-yellow-400">
          {[1, 2, 3, 4, 5].map(star => (
            <FiStar key={star} className={star <= Math.round(product.rating) ? 'fill-current' : ''} />
          ))}
        </div>
        <span className="font-medium">{product.rating}/5</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-slate-500">{product.reviews} Đánh giá</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-slate-500">Đã bán {product.sold}</span>
      </div>

      <div className="flex items-end gap-4 mb-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          {formatPrice(product.price)}
        </span>
        {product.oldPrice && (
          <span className="text-xl text-slate-400 line-through mb-1">{formatPrice(product.oldPrice)}</span>
        )}
      </div>

      {/* Highlighted Specs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">Snapdragon 8 Gen 3</span>
        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">RAM 16GB</span>
        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">OLED 120Hz</span>
        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">Sạc nhanh 120W</span>
      </div>

      {/* Variants */}
      <div className="space-y-6 mb-8">
        <div>
          <h3 className="font-bold mb-3">Phiên bản (RAM)</h3>
          <div className="flex flex-wrap gap-3">
            {variants.map(variant => (
              <button key={variant} onClick={() => setSelectedVariant(variant)}
                className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all ${selectedVariant === variant ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}>
                {variant}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-3">Bộ nhớ (Storage)</h3>
          <div className="flex flex-wrap gap-3">
            {storages.map(storage => (
              <button key={storage} onClick={() => setSelectedStorage(storage)}
                className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all ${selectedStorage === storage ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}>
                {storage}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-3">Màu sắc</h3>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => (
              <button key={color} onClick={() => setSelectedColor(color)}
                className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center gap-2 ${selectedColor === color ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}>
                {selectedColor === color && <FiCheck />}{color}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <h3 className="font-bold mb-3">Số lượng</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button type="button" onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95">
                <FiMinus />
              </button>
              <input type="text" value={quantity}
                onChange={(e) => { const val = e.target.value; if (val === '') { setQuantity('' as any); } else { const num = parseInt(val); if (!isNaN(num)) setQuantity(num); } }}
                onBlur={() => { if (!quantity || Number(quantity) < 1) setQuantity(1); }}
                className="w-16 h-10 text-center border-none bg-transparent font-bold text-lg focus:ring-0 p-0" />
              <button type="button" onClick={() => setQuantity((Number(quantity) || 0) + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95">
                <FiPlus />
              </button>
            </div>
            <span className="text-sm text-slate-500 font-medium">120 sản phẩm có sẵn</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-auto">
        <button className="w-14 h-14 shrink-0 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <FiHeart className="text-2xl" />
        </button>
        <button onClick={handleAddToCart}
          className="flex-1 h-14 rounded-2xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2">
          <FiShoppingCart className="text-xl" /> Thêm vào giỏ
        </button>
        <button onClick={handleBuyNow}
          className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all">
          Mua ngay
        </button>
      </div>
    </div>
  );
}
