import { useState } from 'react';
import { FiZap, FiPlus, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';
import { adminFlashSaleService } from '@/apis';
import type { FlashSaleResponse } from '@/types';
import type { FlashSaleRequest, FlashSaleItemRequest } from '@/apis/services/adminFlashSaleService';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { AdminPagination, ActionButtons, PrimaryButton, ConfirmDialog, StatusBadge, Modal, ModalCancelButton, ModalSubmitButton, FormInput, FormTextarea } from '@/components/ui';
import useAdminList from '@/hooks/useAdminList';
import ProductPickerModal, { SelectedVariant } from '@/components/dialog/ProductPickerModal';
import { formatPrice } from '@/utils/format';
import { FiTrash2 } from 'react-icons/fi';

export interface FlashSaleItemForm extends FlashSaleItemRequest {
  id?: string;
  productName: string;
  variantName: string;
  originalPrice: number;
  imageUrl: string;
}

export default function FlashSales() {
  const { items: sales, loading, pageData, page, setPage, refetch: fetchSales } =
    useAdminList<FlashSaleResponse>(adminFlashSaleService.getAll, { size: PAGE_SIZE.LARGE });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSaleResponse | null>(null);
  const [form, setForm] = useState<{
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    items: FlashSaleItemForm[];
  }>({ name: '', startTime: '', endTime: '', items: [] });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const openCreate = () => {
    setEditingSale(null);
    setForm({ name: '', description: '', startTime: '', endTime: '', items: [] });
    setIsModalOpen(true);
  };

  const openEdit = (sale: FlashSaleResponse) => {
    setEditingSale(sale);
    setForm({
      name: sale.name,
      description: sale.description || '',
      startTime: sale.startTime?.slice(0, 16) || '',
      endTime: sale.endTime?.slice(0, 16) || '',
      items: sale.items?.map(i => ({
        id: i.id,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        originalPrice: i.originalPrice,
        imageUrl: i.imageUrl,
        flashPrice: i.flashPrice,
        flashStock: i.flashStock,
      })) || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingSale) {
        await adminFlashSaleService.update(editingSale.id, {
          ...form,
          items: form.items.map(i => ({ variantId: i.variantId, flashPrice: i.flashPrice, flashStock: i.flashStock }))
        });
        toast.success('Cập nhật Flash Sale thành công!');
      } else {
        await adminFlashSaleService.create({
          ...form,
          items: form.items.map(i => ({ variantId: i.variantId, flashPrice: i.flashPrice, flashStock: i.flashStock }))
        });
        toast.success('Tạo Flash Sale thành công!');
      }
      setIsModalOpen(false);
      fetchSales({ silent: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Lưu Flash Sale thất bại!');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminFlashSaleService.delete(id);
      toast.success('Xóa Flash Sale thành công!');
      fetchSales({ silent: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Xóa Flash Sale thất bại!');
    }
  };
  const handleAddVariants = (selectedVariants: SelectedVariant[]) => {
    const newItems = selectedVariants.map(v => ({
      variantId: v.variantId,
      productName: v.productName,
      variantName: v.variantName,
      originalPrice: v.originalPrice,
      imageUrl: v.imageUrl,
      flashPrice: v.originalPrice, // Default to original
      flashStock: 0,
    }));
    setForm(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
  };

  const handleRemoveItem = (index: number) => {
    setForm(prev => {
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  const handleChangeItem = (index: number, field: 'flashPrice' | 'flashStock', value: number) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiZap className="text-yellow-500" /> Quản lý Flash Sale
        </h1>
        <PrimaryButton onClick={openCreate} icon={<FiPlus className="text-base" />}>
          Tạo Flash Sale
        </PrimaryButton>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 font-medium">Tên sự kiện</th>
                <th className="p-4 font-medium">Bắt đầu</th>
                <th className="p-4 font-medium">Kết thúc</th>
                <th className="p-4 font-medium">Sản phẩm</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Chưa có Flash Sale nào</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-sm">{sale.name}</div>
                    {sale.description && <div className="text-xs text-slate-400 mt-1">{sale.description}</div>}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(sale.startTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(sale.endTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 text-sm font-medium">{sale.items?.length || 0} SP</td>
                  <td className="p-4">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="p-4">
                    <ActionButtons
                      actions={[
                        {
                          type: 'edit',
                          onClick: () => openEdit(sale)
                        },
                        {
                          type: 'delete',
                          onClick: () => setDeleteTarget(sale.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData && (
          <AdminPagination
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="flash sale"
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="3xl"
        title={editingSale ? 'Sửa Flash Sale' : 'Tạo Flash Sale mới'}
        footer={
          <>
            <ModalCancelButton onClick={() => setIsModalOpen(false)} />
            <ModalSubmitButton onClick={handleSubmit} icon={<FiCheck />}>
              {editingSale ? 'Cập nhật' : 'Tạo mới'}
            </ModalSubmitButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Tên sự kiện *"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormTextarea
            label="Mô tả"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            inputClassName="h-24"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Bắt đầu *"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <FormInput
              label="Kết thúc *"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Sản phẩm tham gia ({form.items.length})</h3>
              <PrimaryButton type="button" onClick={() => setIsPickerOpen(true)} icon={<FiPlus />}>
                Thêm sản phẩm
              </PrimaryButton>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
              <table className="w-full text-left bg-white text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-medium text-slate-600">Sản phẩm</th>
                    <th className="p-3 font-medium text-slate-600 w-32">Giá gốc</th>
                    <th className="p-3 font-medium text-slate-600 w-36">Giá Flash Sale</th>
                    <th className="p-3 font-medium text-slate-600 w-32">SL Bán</th>
                    <th className="p-3 font-medium text-slate-600 w-16 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Chưa có sản phẩm nào được chọn
                      </td>
                    </tr>
                  ) : (
                    form.items.map((item, idx) => (
                      <tr key={`${item.variantId}-${idx}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={item.imageUrl || '/placeholder.png'} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800 truncate" title={item.productName}>{item.productName}</div>
                              <div className="text-xs text-slate-500">{item.variantName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">{formatPrice(item.originalPrice)}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={item.flashPrice}
                            onChange={(e) => handleChangeItem(idx, 'flashPrice', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={item.flashStock}
                            onChange={(e) => handleChangeItem(idx, 'flashStock', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <ProductPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleAddVariants}
        initialSelectedIds={form.items.map(i => i.variantId)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa Flash Sale"
        message="Bạn có chắc muốn xóa Flash Sale này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
