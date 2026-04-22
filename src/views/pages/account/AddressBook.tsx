import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import { PrimaryButton, ConfirmDialog, Modal, Button, Checkbox } from '@/components';
import addressService from '@/apis/services/addressService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { AddressResponse, AddressRequest } from '@/types';

export default function AddressBook() {
  const { t } = useTranslation(['account', 'checkout']);
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
    } catch { toast.error(t('account:addressBook.toasts.saveFailed')); }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try { await addressService.delete(id); fetchAddresses(); } catch { toast.error(t('account:addressBook.toasts.deleteFailed')); }
  };

  const handleSetDefault = async (id: string) => {
    try { await addressService.setDefault(id); fetchAddresses(); } catch { toast.error(t('account:addressBook.toasts.setDefaultFailed')); }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{t('account:addressBook.title')}</h1>
          <p className="text-sm sm:text-md text-slate-500 mt-1">{t('account:addressBook.description')}</p>
        </div>
        <PrimaryButton onClick={() => { resetForm(); setShowForm(true); }} icon={<FiPlus className="text-base" />} className="w-full sm:w-auto">
          {t('account:addressBook.addNew')}
        </PrimaryButton>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-16 text-center border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/10 dark:to-blue-900/10 opacity-50"></div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 sm:mb-6 relative z-10 border border-slate-50 dark:border-slate-700">
            <FiMapPin className="text-3xl sm:text-4xl text-blue-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 relative z-10 text-slate-800 dark:text-white">{t('account:addressBook.emptyTitle')}</h3>
          <p className="text-md sm:text-base text-slate-500 mb-6 sm:mb-8 max-w-sm relative z-10">{t('account:addressBook.emptyDescription')}</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-500 hover:text-blue-700 text-blue-600 dark:text-blue-400 font-semibold rounded-xl transition-all flex items-center gap-2 relative z-10 shadow-sm hover:shadow-md text-md sm:text-base"
          >
            <FiPlus />
            {t('account:addressBook.emptyAction')}
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 shadow-sm border transition-all ${addr.isDefault ? 'border-blue-300 dark:border-blue-700' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2">
                    <span className="font-bold text-md sm:text-base">{addr.fullName}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-sm sm:text-md text-slate-500">{addr.phoneNumber}</span>
                    {addr.isDefault && <span className="px-2 py-0.5 rounded text-sm font-medium bg-blue-100 text-blue-600">{t('account:addressBook.default')}</span>}
                  </div>
                  <p className="text-sm sm:text-md text-slate-500">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-0">
                  {!addr.isDefault && (
                    <Button variant="outline" size="md" onClick={() => handleSetDefault(addr.id)} title={t('account:addressBook.setDefaultTitle')} icon={<FiCheck className="text-[1.5rem]" />}>
                      {t('account:addressBook.setDefault')}
                    </Button>
                  )}
                  <Button variant="secondary" size="md" onClick={() => handleEdit(addr)} title={t('account:addressBook.editTitle')} icon={<FiEdit2 className="text-[1.5rem]" />}>
                    {t('account:addressBook.edit')}
                  </Button>
                  {!addr.isDefault && (
                    <Button variant="danger" size="md" onClick={() => setDeleteTarget(addr.id)} title={t('account:addressBook.deleteTitle')} icon={<FiTrash2 className="text-[1.5rem]" />}>
                      {t('account:addressBook.delete')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? t('account:addressBook.modal.editTitle') : t('account:addressBook.modal.addTitle')}
        size="xl"
        scrollable
        footer={
          <>
            <button onClick={resetForm} className="px-5 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-md sm:text-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{t('account:addressBook.modal.cancel')}</button>
            <button onClick={handleSubmit} className="px-5 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-md sm:text-lg font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/30 transform hover:-translate-y-1">
              {t('account:addressBook.modal.save')}
            </button>
          </>
        }
      >
        <div className="space-y-5 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('checkout:address.form.fullName')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('checkout:address.form.fullNamePlaceholder')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('checkout:address.form.phoneNumber')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('checkout:address.form.phoneNumberPlaceholder')} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('checkout:address.form.province')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('checkout:address.form.provincePlaceholder')} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('checkout:address.form.district')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('checkout:address.form.districtPlaceholder')} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('checkout:address.form.ward')}</label>
              <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('checkout:address.form.wardPlaceholder')} value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('checkout:address.form.detailAddress')}</label>
            <input className="w-full h-12 sm:h-16 px-4 sm:px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none transition-all text-md sm:text-lg" placeholder={t('checkout:address.form.detailAddressPlaceholder')} value={form.detailAddress} onChange={(e) => setForm({ ...form, detailAddress: e.target.value })} />
          </div>

          <div className="pt-1 sm:pt-4">
            <label className="inline-flex items-center gap-3 sm:gap-4 cursor-pointer p-4 sm:p-5 rounded-2xl border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 shrink-0">
                <Checkbox
                  checked={form.isDefault || false}
                  onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px]"
                />
              </div>
              <div>
                <span className="text-md sm:text-lg font-bold text-slate-800 dark:text-slate-200">{t('checkout:address.form.setDefault')}</span>
                <p className="text-sm sm:text-base text-slate-500 mt-0.5">{t('checkout:address.form.setDefaultHint')}</p>
              </div>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('account:addressBook.deleteDialog.title')}
        message={t('account:addressBook.deleteDialog.message')}
        confirmLabel={t('account:addressBook.deleteDialog.confirm')}
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
