import { useState } from 'react';
import { FiArrowLeft, FiImage, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductForm() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState([{ name: '', price: '', stock: '' }]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button className="btn btn-primary btn-md gap-2">
            <FiSave /> Lưu sản phẩm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold mb-4">Thông tin cơ bản</h2>
            
            <div>
              <label className="block font-medium mb-2">Tên sản phẩm *</label>
              <input type="text" placeholder="Nhập tên sản phẩm..." className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">Danh mục *</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="phone">Điện thoại</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Máy tính bảng</option>
                  <option value="accessory">Phụ kiện</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Thương hiệu</label>
                <select className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Chọn thương hiệu</option>
                  <option value="apple">Apple</option>
                  <option value="samsung">Samsung</option>
                  <option value="xiaomi">Xiaomi</option>
                  <option value="asus">ASUS</option>
                  <option value="dell">Dell</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Mô tả sản phẩm</label>
              <textarea 
                placeholder="Nhập mô tả chi tiết sản phẩm..." 
                className="w-full h-64 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-y outline-none"
              ></textarea>
            </div>
          </div>

          {/* Dynamic Fields based on Category */}
          {selectedCategory && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h2 className="text-lg font-bold mb-4">Thông số kỹ thuật chi tiết</h2>
              
              {selectedCategory === 'phone' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Màn hình</label>
                    <input type="text" placeholder="VD: 6.7 inch, Super Retina XDR OLED" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hệ điều hành</label>
                    <input type="text" placeholder="VD: iOS 17" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera sau</label>
                    <input type="text" placeholder="VD: Chính 48 MP & Phụ 12 MP, 12 MP" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera trước</label>
                    <input type="text" placeholder="VD: 12 MP" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chip (CPU)</label>
                    <input type="text" placeholder="VD: Apple A17 Pro" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Dung lượng pin & Sạc</label>
                    <input type="text" placeholder="VD: 4422 mAh, 20W" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}

              {selectedCategory === 'laptop' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CPU</label>
                    <input type="text" placeholder="VD: Intel Core i7-13700H" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">RAM</label>
                    <input type="text" placeholder="VD: 16 GB DDR5" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ổ cứng</label>
                    <input type="text" placeholder="VD: 512 GB SSD NVMe PCIe" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Màn hình</label>
                    <input type="text" placeholder="VD: 15.6 inch, Full HD (1920 x 1080), 144Hz" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card màn hình (GPU)</label>
                    <input type="text" placeholder="VD: NVIDIA GeForce RTX 4060 8GB" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hệ điều hành</label>
                    <input type="text" placeholder="VD: Windows 11 Home" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}

              {selectedCategory === 'tablet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Màn hình</label>
                    <input type="text" placeholder="VD: 11 inch, Liquid Retina" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hệ điều hành</label>
                    <input type="text" placeholder="VD: iPadOS 17" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chip (CPU)</label>
                    <input type="text" placeholder="VD: Apple M2" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Dung lượng pin</label>
                    <input type="text" placeholder="VD: 28.65 Wh (~ 7538 mAh)" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}

              {selectedCategory === 'accessory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Loại phụ kiện</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Chọn loại phụ kiện</option>
                      <option value="case">Ốp lưng / Bao da</option>
                      <option value="charger">Củ sạc / Cáp sạc</option>
                      <option value="powerbank">Pin dự phòng</option>
                      <option value="audio">Tai nghe / Loa</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Thiết bị tương thích</label>
                    <input type="text" placeholder="VD: iPhone 15 Pro Max, Galaxy S24 Ultra" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chất liệu</label>
                    <input type="text" placeholder="VD: Nhựa dẻo TPU, Silicone" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tính năng đặc biệt</label>
                    <input type="text" placeholder="VD: Hỗ trợ sạc MagSafe, Chống sốc" className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Variants */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Phân loại hàng (Variants)</h2>
              <button 
                onClick={addVariant}
                className="text-sm font-medium text-purple-600 hover:underline flex items-center gap-1"
              >
                <FiPlus /> Thêm phân loại
              </button>
            </div>
            
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-500">Tên phân loại (VD: Đen - 256GB)</label>
                      <input type="text" placeholder="Đen - 256GB" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-500">Giá bán (VNĐ)</label>
                      <input type="number" placeholder="0" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-500">Tồn kho</label>
                      <input type="number" placeholder="0" className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-sm" />
                    </div>
                  </div>
                  {variants.length > 1 && (
                    <button 
                      onClick={() => removeVariant(index)}
                      className="h-10 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold mb-4">Hình ảnh sản phẩm</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FiImage className="text-xl" />
                </div>
                <span className="font-medium text-sm">Tải ảnh lên</span>
                <span className="text-xs mt-1">PNG, JPG, WEBP (Max 5MB)</span>
              </div>
              
              {/* Placeholder for uploaded images */}
              <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative group overflow-hidden">
                <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png" alt="Preview" className="w-full h-full object-cover" />
                <button className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg">
                  <FiTrash2 />
                </button>
              </div>
              <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <FiPlus className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Pricing & Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold mb-4">Trạng thái & Giá</h2>
            
            <div>
              <label className="block font-medium mb-2">Trạng thái</label>
              <select className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500">
                <option value="active">Đang bán</option>
                <option value="draft">Bản nháp</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Giá gốc (VNĐ)</label>
              <input type="number" placeholder="0" className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div>
              <label className="block font-medium mb-2">Giá khuyến mãi (VNĐ)</label>
              <input type="number" placeholder="0" className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
