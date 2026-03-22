import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import adminCategoryService from '@/apis/services/adminCategoryService';
import type { CategoryResponse, PageResponse } from '@/types';

export default function Categories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<CategoryResponse> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '', parentId: '' });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryService.getAll({ keyword: searchQuery || undefined, page, size: 20 });
      setPageData(res.data);
      setCategories(res.data.data || []);
    } catch (err) { console.error('Failed to fetch categories:', err); }
    finally { setLoading(false); }
  }, [searchQuery, page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminCategoryService.update(editId, formData);
      } else {
        await adminCategoryService.create(formData);
      }
      setShowForm(false); setEditId(null);
      setFormData({ name: '', description: '', imageUrl: '', parentId: '' });
      fetchCategories();
    } catch (err) { console.error('Save failed:', err); }
  };

  const handleEdit = (cat: CategoryResponse) => {
    setEditId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '', parentId: '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try { await adminCategoryService.delete(id); fetchCategories(); }
    catch (err) { console.error('Delete failed:', err); }
  };

  const handleToggle = async (id: string) => {
    try { await adminCategoryService.toggleStatus(id); fetchCategories(); }
    catch (err) { console.error('Toggle failed:', err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: '', description: '', imageUrl: '', parentId: '' }); }}
          className="btn btn-primary btn-md gap-2"><FiPlus /> Thêm danh mục</button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-4">{editId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Tên danh mục" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
              className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 flex-1" />
            <input type="text" placeholder="Mô tả" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 flex-1" />
            <button type="submit" className="h-12 px-6 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
              {editId ? 'Cập nhật' : 'Tạo'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              className="h-12 px-6 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Hủy</button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative">
          <input type="text" placeholder="Tìm kiếm danh mục..."
            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500" />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                    <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                    <td className="p-4"><div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400">Không có danh mục nào</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />}
                        <div>
                          <span className="font-bold">{cat.name}</span>
                          {cat.description && <span className="text-xs text-slate-400 block">{cat.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-sm">{cat.slug}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                        {cat.active ? 'Hoạt động' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(cat.id)} className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title={cat.active ? 'Ẩn' : 'Hiện'}>
                          {cat.active ? <FiToggleRight className="text-green-500" /> : <FiToggleLeft />}
                        </button>
                        <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Sửa"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Xóa"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pageData && pageData.lastPage > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <div>Trang {page}/{pageData.lastPage}</div>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&lt;</button>
              {Array.from({ length: Math.min(pageData.lastPage, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${p === page ? 'bg-purple-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageData.lastPage, p + 1))} disabled={page === pageData.lastPage} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
