import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiStar, FiHeart, FiShoppingCart, FiChevronRight, FiCheck, FiThumbsUp, FiMessageSquare, FiImage, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { mockProducts, formatPrice } from '@/utils/mockData';
import ProductCard from '@/components/ui/ProductCard';
import { motion, AnimatePresence } from 'motion/react';

const reviews = [
  { id: 1, user: 'Nguyễn Văn A', avatar: 'https://picsum.photos/seed/user1/50/50', rating: 5, date: '12/10/2026', content: 'Sản phẩm tuyệt vời, đóng gói cẩn thận, giao hàng nhanh.', images: ['https://picsum.photos/seed/rev1/200/200'] },
  { id: 2, user: 'Trần Thị B', avatar: 'https://picsum.photos/seed/user2/50/50', rating: 4, date: '10/10/2026', content: 'Máy xài mượt, màn hình đẹp nhưng pin hơi hẻo.', images: [] },
  { id: 3, user: 'Lê Hoàng C', avatar: 'https://picsum.photos/seed/user3/50/50', rating: 5, date: '05/10/2026', content: 'Rất hài lòng với chất lượng phục vụ của shop.', images: ['https://picsum.photos/seed/rev2/200/200', 'https://picsum.photos/seed/rev3/200/200'] },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = mockProducts.find(p => p.id === id) || mockProducts[0];
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('8GB');
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Đen');
  const [activeTab, setActiveTab] = useState('description');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const images = [
    product.image,
    `https://picsum.photos/seed/${product.id}a/800/800`,
    `https://picsum.photos/seed/${product.id}b/800/800`,
    `https://picsum.photos/seed/${product.id}c/800/800`,
  ];

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
          selectedColor
        }
      }
    });
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-purple-600">Trang chủ</Link></li>
          <li><FiChevronRight /></li>
          <li><Link to="/search" className="hover:text-purple-600">{product.category}</Link></li>
          <li><FiChevronRight /></li>
          <li><span className="text-slate-900 dark:text-slate-100 font-medium line-clamp-1">{product.name}</span></li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Images */}
          <div className="w-full lg:w-5/12">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-4 group">
              <img 
                src={images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                referrerPolicy="no-referrer"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  Giảm {product.discount}%
                </div>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 snap-start border-2 transition-all ${activeImage === idx ? 'border-purple-500 shadow-md shadow-purple-500/20' : 'border-transparent hover:border-purple-300'}`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
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
                <span className="text-xl text-slate-400 line-through mb-1">
                  {formatPrice(product.oldPrice)}
                </span>
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
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all ${selectedVariant === variant ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Bộ nhớ (Storage)</h3>
                <div className="flex flex-wrap gap-3">
                  {storages.map(storage => (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all ${selectedStorage === storage ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Màu sắc</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center gap-2 ${selectedColor === color ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'}`}
                    >
                      {selectedColor === color && <FiCheck />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-bold mb-3">Số lượng</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95"
                    >
                      <FiMinus />
                    </button>
                    <input 
                      type="text" 
                      value={quantity} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setQuantity('' as any);
                        } else {
                          const num = parseInt(val);
                          if (!isNaN(num)) {
                            setQuantity(num);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (!quantity || Number(quantity) < 1) setQuantity(1);
                      }}
                      className="w-16 h-10 text-center border-none bg-transparent font-bold text-lg focus:ring-0 p-0"
                    />
                    <button 
                      type="button"
                      onClick={() => setQuantity((Number(quantity) || 0) + 1)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition-all active:scale-95"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">
                    120 sản phẩm có sẵn
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-auto">
              <button className="w-14 h-14 shrink-0 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <FiHeart className="text-2xl" />
              </button>
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-14 rounded-2xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2"
              >
                <FiShoppingCart className="text-xl" /> Thêm vào giỏ
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-12 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'description', label: 'Mô tả sản phẩm' },
            { id: 'specs', label: 'Thông số kỹ thuật' },
            { id: 'reviews', label: `Đánh giá (${product.reviews})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center font-bold text-lg transition-colors relative ${activeTab === tab.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose dark:prose-invert max-w-none">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <img src={images[1]} alt="Description" className="rounded-2xl my-8 w-full max-w-3xl mx-auto" />
              <h3>Tính năng nổi bật</h3>
              <ul>
                <li>Hiệu năng mạnh mẽ với chip xử lý mới nhất</li>
                <li>Màn hình sắc nét, tần số quét cao</li>
                <li>Thiết kế mỏng nhẹ, sang trọng</li>
                <li>Thời lượng pin ấn tượng</li>
              </ul>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="max-w-3xl mx-auto border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <tbody>
                    {/* Màn hình */}
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Màn hình</td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Công nghệ màn hình</td>
                      <td className="py-4 px-6 font-bold">OLED, 120Hz, HDR10+</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Kích thước</td>
                      <td className="py-4 px-6 font-bold">6.8 inch</td>
                    </tr>
                    
                    {/* Camera */}
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Camera</td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Camera sau</td>
                      <td className="py-4 px-6 font-bold">Chính 50 MP & Phụ 12 MP, 10 MP</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Camera trước</td>
                      <td className="py-4 px-6 font-bold">12 MP</td>
                    </tr>

                    {/* CPU */}
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Vi xử lý & Đồ họa</td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Chipset (CPU)</td>
                      <td className="py-4 px-6 font-bold">Snapdragon 8 Gen 3</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Chip đồ họa (GPU)</td>
                      <td className="py-4 px-6 font-bold">Adreno 750</td>
                    </tr>

                    {/* Pin & Sạc */}
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Pin & Sạc</td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Dung lượng pin</td>
                      <td className="py-4 px-6 font-bold">5000 mAh</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Hỗ trợ sạc tối đa</td>
                      <td className="py-4 px-6 font-bold">120W</td>
                    </tr>

                    {/* Cổng kết nối */}
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <td colSpan={2} className="py-3 px-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-sm tracking-wider">Kết nối</td>
                    </tr>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Cổng sạc</td>
                      <td className="py-4 px-6 font-bold">Type-C</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td className="py-4 px-6 font-medium text-slate-500 w-1/3">Jack tai nghe</td>
                      <td className="py-4 px-6 font-bold">Không</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Review Overview */}
              <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
                <div className="text-center md:w-1/4">
                  <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-2">
                    {product.rating}
                  </div>
                  <div className="flex justify-center gap-1 text-yellow-400 text-xl mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar key={star} className={star <= Math.round(product.rating) ? 'fill-current' : ''} />
                    ))}
                  </div>
                  <div className="text-slate-500">{product.reviews} đánh giá</div>
                </div>
                
                <div className="flex-1 w-full space-y-2">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-12 text-sm font-medium">
                        {star} <FiStar className="text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                          style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-sm text-slate-500 text-right">
                        {star === 5 ? 85 : star === 4 ? 25 : star === 3 ? 14 : 0}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="md:w-1/4 flex flex-col items-center justify-center">
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    Viết đánh giá
                  </button>
                </div>
              </div>

              {/* Review Filters */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button className="px-4 py-2 rounded-lg border border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium">Tất cả</button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 font-medium">5 Sao (85)</button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 font-medium">4 Sao (25)</button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 font-medium flex items-center gap-2">
                  <FiImage /> Có hình ảnh (42)
                </button>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold">{review.user}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-yellow-400 text-sm">
                              {[1, 2, 3, 4, 5].map(star => (
                                <FiStar key={star} className={star <= review.rating ? 'fill-current' : ''} />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <FiCheck /> Đã mua hàng
                      </div>
                    </div>
                    
                    <p className="text-slate-700 dark:text-slate-300 mb-4">{review.content}</p>
                    
                    {review.images.length > 0 && (
                      <div className="flex gap-3 mb-4">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Review" className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 cursor-zoom-in hover:opacity-80 transition-opacity" />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                        <FiThumbsUp /> Hữu ích (12)
                      </button>
                      <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                        <FiMessageSquare /> Thảo luận
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar">
          {mockProducts.slice(0, 6).map(product => (
            <div key={product.id} className="min-w-[240px] md:min-w-[280px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Viết đánh giá</h2>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                  <h3 className="font-bold line-clamp-2">{product.name}</h3>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Đánh giá của bạn</label>
                  <div className="flex gap-2 text-3xl text-slate-300 dark:text-slate-600 cursor-pointer">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar key={star} className="hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Nội dung đánh giá</label>
                  <textarea 
                    rows={4} 
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-none"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Thêm hình ảnh</label>
                  <div className="flex gap-3">
                    <button className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all">
                      <FiPlus className="text-2xl mb-1" />
                      <span className="text-xs font-medium">Thêm ảnh</span>
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Gửi đánh giá
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
