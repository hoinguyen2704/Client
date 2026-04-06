import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import { PrimaryButton, ConfirmDialog, Modal } from '@/components';
import addressService from '@/apis/services/addressService';
import { toast } from 'sonner';
import type { AddressResponse, AddressRequest } from '@/types';

export default function AddressBook() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressRequest>({ fullName: '', phoneNumber: '', province: '', district: '', ward: '', detailAddress: '', isDefault: false });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressService.getMyAddresses();
      setAddresses(res.data || []);
    } catch { setAddresses([]); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setForm({ fullName: '', phoneNumber: '', province: '', district: '', ward: '', detailAddress: '', isDefault: false }); setEditId(null); setShowForm(false); };

  const handleEdit = (addr: AddressResponse) => {
    setEditId(addr.id);
    setForm({ fullName: addr.fullName, phoneNumber: addr.phoneNumber, province: addr.province, district: addr.district, ward: addr.ward, detailAddress: addr.detailAddress, isDefault: addr.isDefault });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editId) { await addressService.update(editId, form); }
      else { await addressService.create(form); }
      resetForm();
      fetchAddresses();
    } catch { toast.error('Lưu địa chỉ thất bại!'); }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try { await addressService.delete(id); fetchAddresses(); } catch { toast.error('Xóa địa chỉ thất bại!'); }
  };

  const handleSetDefault = async (id: string) => {
    try { await addressService.setDefault(id); fetchAddresses(); } catch { toast.error('Đặt mặc định thất bại!'); }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Sổ địa chỉ</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Quản lý địa chỉ nhận hàng của bạn</p>
        </div>
        <PrimaryButton onClick={() => { resetForm(); setShowForm(true); }} icon={<FiPlus className="text-base" />} className="w-full sm:w-auto">
          Thêm địa chỉ mới
        </PrimaryButton>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-16 text-center border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 opacity-50"></div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 sm:mb-6 relative z-10 border border-slate-50 dark:border-slate-700">
            <FiMapPin className="text-3xl sm:text-4xl text-purple-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10 text-slate-800 dark:text-white">Chưa có địa chỉ nào</h3>
          <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 max-w-sm relative z-10">Thêm địa chỉ nhận hàng để tiện cho việc thanh toán và để chúng tôi giao hàng nhanh chóng hơn.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900/50 hover:border-purple-500 hover:text-purple-700 text-purple-600 dark:text-purple-400 font-semibold rounded-xl transition-all flex items-center gap-2 relative z-10 shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            <FiPlus />
            Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 shadow-sm border transition-all ${addr.isDefault ? 'border-purple-300 dark:border-purple-700' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2">
                    <span className="font-bold text-sm sm:text-base">{addr.fullName}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-xs sm:text-sm text-slate-500">{addr.phoneNumber}</span>
                    {addr.isDefault && <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-600">Mặc định</span>}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 ml-2">
                  {!addr.isDefault && <button onClick={() => handleSetDefault(addr.id)} className="p-2 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20" title="Đặt mặc định"><FiCheck /></button>}
                  <button onClick={() => handleEdit(addr)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"><FiEdit2 /></button>
                  {!addr.isDefault && <button onClick={() => setDeleteTarget(addr.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><FiTrash2 /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? 'Sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
        size="xl"
        scrollable
        footer={
          <>
            <button onClick={resetForm} className="px-5 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Hủy bỏ</button>
            <button onClick={handleSubmit} className="px-5 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm sm:text-lg font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/30 transform hover:-translate-y-1">
              Lưu địa chỉ
            </button>
          </>
        }
      >
        <div className="space-y-5 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Họ và tên người nhận</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Nhập họ và tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Số điện thoại liên hệ</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Nhập số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tỉnh/Thành phố</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: TP. Hà Nội" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quận/Huyện</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: Cầu Giấy" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phường/Xã</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: Minh Khai" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Địa chỉ cụ thể (Số nhà, tên đường)</label>
            <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm sm:text-lg" placeholder="Ví dụ: 123 đường Xuân Thủy" value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} />
          </div>

          <div className="pt-1 sm:pt-4">
            <label className="inline-flex items-center gap-3 sm:gap-4 cursor-pointer p-4 sm:p-5 rounded-2xl border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 shrink-0">
                <input type="checkbox" checked={form.isDefault || false} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="peer appearance-none w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] border-2 border-slate-300 dark:border-slate-600 checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer" />
                <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3] text-lg" />
              </div>
              <div>
                <span className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-200">Đặt làm địa chỉ mặc định</span>
                <p className="text-xs sm:text-base text-slate-500 mt-0.5">Chúng tôi sẽ dùng địa chỉ này ưu tiên cho các đơn hàng tiếp theo của bạn.</p>
              </div>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa địa chỉ"
        message="Bạn có chắc muốn xóa địa chỉ này?"
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
