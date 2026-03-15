import { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/helpers/format';

const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', category: 'Điện thoại', price: 34990000, stock: 150, status: 'active', image: 'https://picsum.photos/seed/iphone15/100/100' },
  { id: 2, name: 'MacBook Air M2 2022', category: 'Laptop', price: 26990000, stock: 45, status: 'active', image: 'https://picsum.photos/seed/macbook/100/100' },
  { id: 3, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 4990000, stock: 0, status: 'out_of_stock', image: 'https://picsum.photos/seed/airpods/100/100' },
  { id: 4, name: 'iPad Pro 11 inch M2', category: 'Tablet', price: 20990000, stock: 20, status: 'hidden', image: 'https://picsum.photos/seed/ipad/100/100' },
  { id: 5, name: 'Samsung Galaxy S24 Ultra', category: 'Điện thoại', price: 33990000, stock: 85, status: 'active', image: 'https://picsum.photos/seed/s24/100/100' },
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(mockProducts.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
              <FiTrash2 /> Xóa ({selectedItems.length})
            </button>
          )}
          <Link 
            to="/admin/products/new"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
          >
            <FiPlus /> Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <div className="flex gap-2">
          <select className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 font-medium outline-none">
            <option value="">Tất cả danh mục</option>
            <option value="phone">Điện thoại</option>
            <option value="laptop">Laptop</option>
            <option value="tablet">Tablet</option>
            <option value="accessory">Phụ kiện</option>
          </select>
          <button className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium">
            <FiFilter /> Lọc
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    checked={selectedItems.length === mockProducts.length && mockProducts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 font-medium">Sản phẩm</th>
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium">Giá bán</th>
                <th className="p-4 font-medium">Tồn kho</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
                      <span className="font-bold line-clamp-2 max-w-[250px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{product.category}</td>
                  <td className="p-4 font-bold text-purple-600">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-orange-500' : ''}`}>
                        {product.stock}
                      </span>
                      {product.stock < 10 && product.stock > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wider">Sắp hết</span>
                      )}
                      {product.stock === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wider">Cạn kho</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.status === 'active' ? 'bg-green-100 text-green-600' :
                      product.status === 'out_of_stock' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {product.status === 'active' ? 'Đang bán' :
                       product.status === 'out_of_stock' ? 'Hết hàng' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${product.id}`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <FiEdit2 />
                      </Link>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <FiMoreVertical />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1-5 của 120 sản phẩm</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
