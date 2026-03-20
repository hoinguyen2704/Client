import { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFolder, FiX, FiCheck } from 'react-icons/fi';
import StatusBadge from '@/components/ui/StatusBadge';
import { initialCategories } from '@/__mocks__/mockAdmin';

export default function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', status: 'active' });

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug, status: category.status });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.slug) return;

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
    } else {
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      setCategories([...categories, { id: newId, ...formData, productCount: 0 }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    // We use a custom modal or just window.confirm for simplicity since it's an admin panel
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Danh mục sản phẩm</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-md btn-primary"
        >
          <FiPlus /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="p-4 font-medium">Tên danh mục</th>
                <th className="p-4 font-medium">Đường dẫn (Slug)</th>
                <th className="p-4 font-medium text-center">Số sản phẩm</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <FiFolder />
                      </div>
                      <span className="font-bold cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleOpenModal(category)}>{category.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{category.slug}</td>
                  <td className="p-4 text-center font-medium">{category.productCount}</td>
                  <td className="p-4">
                    <StatusBadge status={category.status} label={category.status === 'active' ? 'Hiển thị' : 'Đã ẩn'} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(category)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg transition-colors" title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-colors" title="Xóa">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Danh mục */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên danh mục</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Đường dẫn (Slug)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                  placeholder="nhap-ten-danh-muc..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="active">Hiển thị</option>
                  <option value="inactive">Đã ẩn</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                <FiCheck /> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
