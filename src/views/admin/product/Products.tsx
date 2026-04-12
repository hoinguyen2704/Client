import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiInfo, FiChevronUp, FiChevronDown, FiDownload } from 'react-icons/fi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/error';
import { formatPrice } from '@/utils/format';
import { Button, CustomSelect, PrimaryButton, AdminSearch, Pagination, ActionButtons, StatusBadge, Checkbox } from '@/components';
import adminProductService from '@/apis/services/adminProductService';
import adminCategoryService from '@/apis/services/adminCategoryService';
import type { ProductResponse, PageResponse, CategoryResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { downloadBlob } from '@/utils/download';

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
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminCategoryService.getAll({ size: PAGE_SIZE.LARGE });
      setCategories(res.data?.data || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fetchProducts = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
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
            fetchProducts({ silent: true });
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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Cập nhật trạng thái thất bại!'));
      console.error('Toggle status failed:', err);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminProductService.export({
        keyword: searchQuery || undefined,
        categoryId: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      downloadBlob(blob, `products_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Đã xuất báo cáo sản phẩm!');
    } catch (err) {
      toast.error('Không thể xuất báo cáo!');
      console.error('Export failed:', err);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? products.map(p => p.id) : []);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalStock = (p: ProductResponse) =>
    p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0;

  const minPrice = (p: ProductResponse) =>
    p.variants?.length ? Math.min(...p.variants.map(v => v.price)) : p.originPrice;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý sản phẩm</h1>
          {selectedItems.length > 0 && (
            <p className="text-md text-slate-500 mt-1">
              Đã chọn <span className="font-bold text-purple-600">{selectedItems.length}</span> sản phẩm
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {selectedItems.length > 0 && (
            <Button
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
                      fetchProducts({ silent: true });
                      if (successCount === toDelete.length) {
                        toast.success(`Đã xóa ${successCount} sản phẩm thành công!`);
                      } else {
                        toast.warning(`Đã xóa ${successCount}/${toDelete.length} sản phẩm. Một số sản phẩm không thể xóa.`);
                      }
                    }
                  },
                });
              }}
              variant="danger"
              size="md"
              icon={<FiTrash2 />}
            >
              Xóa ({selectedItems.length})
            </Button>
          )}
          <Button onClick={handleExport} variant="success" size="md" icon={<FiDownload />}>
            Xuất Excel
          </Button>
          <PrimaryButton href="/admin/products/new" icon={<FiPlus className="text-base" />}>
            Thêm sản phẩm
          </PrimaryButton>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setPage(1); }}
          />
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
          <table className="w-full min-w-[920px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md divide-x divide-slate-200 dark:divide-slate-700">
                <th className="p-4 font-medium w-10 text-center">
                  <Checkbox
                    checked={selectedItems.length === products.length && products.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Sản phẩm {sortBy === 'name' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('originPrice')}>
                  <div className="flex items-center gap-1">Giá bán {sortBy === 'originPrice' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none text-center" onClick={() => handleSort('totalStock')}>
                  <div className="flex items-center justify-center gap-1">Tồn kho {sortBy === 'totalStock' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none text-center" onClick={() => handleSort('totalSold')}>
                  <div className="flex items-center justify-center gap-1">Đã bán {sortBy === 'totalSold' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Trạng thái {sortBy === 'status' && (sortDir === 'ASC' ? <FiChevronUp /> : <FiChevronDown />)}</div>
                </th>
                <th className="p-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 animate-pulse">
                    <td className="p-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto" /></td>
                    <td className="p-4"><div className="flex gap-3"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" /><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mt-4" /></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto" /></td>
                    <td className="p-4"><div className="h-4 w-10 bg-slate-200 dark:bg-slate-700 rounded mx-auto" /></td>
                    <td className="p-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                    <td className="p-4"><div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="p-10 sm:p-12 text-center text-slate-400 border-b border-slate-200 dark:border-slate-700">Không có sản phẩm nào</td></tr>
              ) : (
                products.map((product) => {
                  const stock = totalStock(product);
                  return (
                    <tr key={product.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group divide-x divide-slate-200 dark:divide-slate-700">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedItems.includes(product.id)}
                          onCheckedChange={() => handleSelectItem(product.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.mainImageUrl || '/placeholder.png'} alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
                          <div>
                            <span className="font-bold line-clamp-1 max-w-[380px]">{product.name}</span>
                            <span className="text-sm text-slate-400 block">{product.brandName || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{product.category?.name || '—'}</td>
                      <td className="p-4 font-bold text-purple-600">{formatPrice(minPrice(product))}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${stock === 0 ? 'text-red-500' : stock < 10 ? 'text-orange-500' : ''}`}>{stock}</span>
                          {stock < 10 && stock > 0 && (
                            <StatusBadge status="low_stock" />
                          )}
                          {stock === 0 && (
                            <StatusBadge status="out_of_stock" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${(product.totalSold ?? 0) > 50 ? 'text-emerald-600' : (product.totalSold ?? 0) > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                          {product.totalSold ?? 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={product.status === 'ACTIVE' ? 'active' : 'hidden'} label={product.status === 'ACTIVE' ? 'Đang bán' : 'Đã ẩn'} />
                      </td>
                      <td className="p-4 text-right">
                        <ActionButtons
                          actions={[
                            {
                              type: 'more',
                              title: product.status === 'ACTIVE' ? 'Ẩn sản phẩm' : 'Hiện sản phẩm',
                              icon: product.status === 'ACTIVE' ? <FiToggleRight className="text-[1.5rem] text-green-500" /> : <FiToggleLeft className="text-[1.5rem]" />,
                              onClick: () => handleToggleStatus(product.id)
                            },
                            {
                              type: 'edit',
                              href: `/admin/products/${product.id}`
                            },
                            {
                              type: 'delete',
                              onClick: () => handleDelete(product.id)
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData && (
          <Pagination variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="sản phẩm"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
