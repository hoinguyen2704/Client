import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiInfo, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/helpers/format';
import CustomSelect from '@/components/ui/CustomSelect';
import PrimaryButton from '@/components/ui/PrimaryButton';
import adminProductService from '@/apis/services/adminProductService';
import adminCategoryService from '@/apis/services/adminCategoryService';
import type { ProductResponse, PageResponse, CategoryResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';

export default function Products() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<ProductResponse> | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminCategoryService.getAll({ size: PAGE_SIZE.LARGE });
      setCategories(res.data?.data || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductService.getAll({
        keyword: searchQuery || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        page, size: PAGE_SIZE.LARGE,
        sortBy, sortDir
      });
      setPageData(res.data);
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter, page, sortBy, sortDir]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortDir('ASC');
    }
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    toast('Xác nhận xóa sản phẩm này?', {
      icon: <FiInfo className="text-red-500" />,
      action: {
        label: 'Xóa',
        onClick: async () => {
          try {
            await adminProductService.delete(id);
            toast.success('Đã xóa sản phẩm thành công!');
            fetchProducts();
          } catch (err) { toast.error('Không thể xóa sản phẩm này!'); console.error('Delete failed:', err); }
        }
      },
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminProductService.toggleStatus(id);
      // Update local state instead of re-fetching to prevent scroll-to-top
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : p
      ));
      toast.success('Đã cập nhật trạng thái sản phẩm!');
    } catch (err: any) {
      toast.error(`Cập nhật trạng thái thất bại! ${err?.message || err?.error || ''}`);
      console.error('Toggle status failed:', err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedItems(e.target.checked ? products.map(p => p.id) : []);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalStock = (p: ProductResponse) =>
    p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0;

  const minPrice = (p: ProductResponse) =>
    p.variants?.length ? Math.min(...p.variants.map(v => v.price)) : p.originPrice;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          {selectedItems.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              Đã chọn <span className="font-bold text-purple-600">{selectedItems.length}</span> sản phẩm
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={() => {
                toast(`Xác nhận xóa ${selectedItems.length} sản phẩm?`, {
                  icon: <FiInfo className="text-red-500" />,
                  description: 'Thao tác này không thể hoàn tác.',
                  action: {
                    label: 'Xóa tất cả',
                    onClick: async () => {
                      const toDelete = [...selectedItems];
                      let successCount = 0;
                      for (const id of toDelete) {
                        try {
                          await adminProductService.delete(id);
                          successCount++;
                        } catch { /* skip failed */ }
                      }
                      setSelectedItems([]);
                      fetchProducts();
                      if (successCount === toDelete.length) {
                        toast.success(`Đã xóa ${successCount} sản phẩm thành công!`);
                      } else {
                        toast.warning(`Đã xóa ${successCount}/${toDelete.length} sản phẩm. Một số sản phẩm không thể xóa.`);
                      }
                    }
                  },
                });
              }}
              className="h-11 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <FiTrash2 className="text-base" />
              Xóa ({selectedItems.length})
            </button>
          )}
          <PrimaryButton href="/admin/products/new" icon={<FiPlus className="text-base" />}>
            Thêm sản phẩm
          </PrimaryButton>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text" placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        </div>
        <CustomSelect
          value={categoryFilter}
          onChange={(val) => { setCategoryFilter(val); setPage(1); }}
          options={[
            { value: '', label: 'Tất cả danh mục' },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name }))
          ]}
          className="w-full md:w-56"
        />
        <CustomSelect
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: 'Đang bán' },
            { value: 'INACTIVE', label: 'Đã ẩn' }
          ]}
          className="w-full md:w-48"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-4 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    checked={selectedItems.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Sản phẩm {sortBy === 'name' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('originPrice')}>
                  <div className="flex items-center gap-1">Giá bán {sortBy === 'originPrice' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('totalStock')}>
                  <div className="flex items-center gap-1">Tồn kho {sortBy === 'totalStock' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Trạng thái {sortBy === 'status' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                    <td className="p-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="flex gap-3"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" /><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" /></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                    <td className="p-4"><div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">Không có sản phẩm nào</td></tr>
              ) : (
                products.map((product) => {
                  const stock = totalStock(product);
                  return (
                    <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          checked={selectedItems.includes(product.id)}
                          onChange={() => handleSelectItem(product.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.mainImageUrl || '/placeholder.png'} alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
                          <div>
                            <span className="font-bold line-clamp-1 max-w-[250px]">{product.name}</span>
                            <span className="text-xs text-slate-400 block">{product.brandName || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{product.category?.name || '—'}</td>
                      <td className="p-4 font-bold text-purple-600">{formatPrice(minPrice(product))}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${stock === 0 ? 'text-red-500' : stock < 10 ? 'text-orange-500' : ''}`}>{stock}</span>
                          {stock < 10 && stock > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wider">Sắp hết</span>
                          )}
                          {stock === 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wider">Cạn kho</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {product.status === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button onClick={() => handleToggleStatus(product.id)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-105 ${
                              product.status === 'ACTIVE' 
                              ? 'text-green-600 bg-slate-100 hover:bg-green-50 dark:bg-slate-800 dark:hover:bg-green-900/20' 
                              : 'text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                            }`}
                            title={product.status === 'ACTIVE' ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}>
                            {product.status === 'ACTIVE' ? <FiToggleRight className="text-[1.3rem]" /> : <FiToggleLeft className="text-[1.3rem]" />}
                          </button>

                          <Link to={`/admin/products/${product.id}`} 
                            className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-all hover:scale-105" 
                            title="Chỉnh sửa">
                            <FiEdit2 className="text-[1.15rem]" />
                          </Link>

                          <button onClick={() => handleDelete(product.id)} 
                            className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-all hover:scale-105" 
                            title="Xóa">
                            <FiTrash2 className="text-[1.15rem]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData && pageData.lastPage > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
            <div>Hiển thị {((page - 1) * PAGE_SIZE.LARGE) + 1}-{Math.min(page * PAGE_SIZE.LARGE, pageData.total)} của {pageData.total} sản phẩm</div>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&lt;</button>
              {Array.from({ length: Math.min(pageData.lastPage, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg ${p === page ? 'bg-purple-600 text-white font-medium shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageData.lastPage, p + 1))} disabled={page === pageData.lastPage}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
