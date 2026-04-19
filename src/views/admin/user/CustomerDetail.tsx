import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiMail, FiPhone, FiCalendar, FiLock, FiUnlock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/error';
import { toast } from 'sonner';
import adminUserService from '@/apis/services/adminUserService';
import { Button, StatusBadge, UserAvatar, BackButton } from '@/components';

import type { UserResponse } from '@/types';

export default function CustomerDetail() {
  const { t } = useTranslation(['adminCustomers', 'common']);
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneReason, setPhoneReason] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminUserService.getById(id)
      .then(res => {
        setUser(res.data);
        setPhoneNumber(res.data.phoneNumber || '');
      })
      .catch(err => console.error('Failed to load user:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    if (!user) return;
    try {
      const res = await adminUserService.toggleStatus(user.id);
      setUser(res.data);
      toast.success(t('detail.toasts.toggleSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('detail.toasts.toggleFailed'));
    }
  };

  const handleUpdatePhone = async () => {
    if (!user) return;
    if (!phoneNumber.trim()) {
      toast.error(t('detail.toasts.phoneRequired'));
      return;
    }
    if (!phoneReason.trim()) {
      toast.error(t('detail.toasts.reasonRequired'));
      return;
    }

    setUpdatingPhone(true);
    try {
      const res = await adminUserService.updatePhone(user.id, {
        phoneNumber: phoneNumber.trim(),
        reason: phoneReason.trim(),
      });
      setUser(res.data);
      setPhoneNumber(res.data.phoneNumber || '');
      setPhoneReason('');
      toast.success(t('detail.toasts.phoneUpdated'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, translate, 'common:errors.updatePhoneFailed'));
    } finally {
      setUpdatingPhone(false);
    }
  };
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackButton to="/admin/customers" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="space-y-2"><div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-center text-slate-400">{t('detail.notFound')}</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton to="/admin/customers" />
        <h1 className="text-xl sm:text-2xl font-bold">{t('detail.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <div className="relative inline-block mb-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
              ) : (
                <UserAvatar name={user.fullName} size="xl" className="border-4 border-white dark:border-slate-800 shadow-md" />
              )}
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-1">{user.fullName}</h2>
            <p className="text-slate-500 text-md mb-4">@{user.userName || user.email.split('@')[0]}</p>

            <div className="flex justify-center gap-2 mb-6">
              <StatusBadge
                status={user.status === 'ACTIVE' ? 'active' : 'banned'}
                label={user.status === 'ACTIVE' ? t('customers.statuses.active') : t('customers.statuses.locked')}
              />
              <StatusBadge status={user.role === 'ADMIN' ? 'admin' : 'user'} />
            </div>

            <Button onClick={handleToggle}
              variant={user.status === 'ACTIVE' ? 'danger' : 'success'}
              size="md"
              fullWidth
              icon={user.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />}
            >
              {user.status === 'ACTIVE' ? t('customers.actions.lock') : t('customers.actions.unlock')}
            </Button>

            <div className="mt-5 sm:mt-6 space-y-3 text-left text-md">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiMail className="text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiPhone className="text-slate-400 shrink-0" />
                <span>{user.phoneNumber || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <FiCalendar className="text-slate-400 shrink-0" />
                <span>{t('detail.joined', { date: formatDate(user.createdAt) })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area — placeholder for orders */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">{t('detail.accountInfo')}</h2>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <span className="text-md text-slate-500">{t('detail.fullName')}</span>
                <p className="font-bold">{user.fullName}</p>
              </div>
              <div>
                <span className="text-md text-slate-500">{t('detail.email')}</span>
                <p className="font-bold">{user.email}</p>
              </div>
              <div>
                <span className="text-md text-slate-500">{t('detail.phone')}</span>
                <p className="font-bold">{user.phoneNumber || '—'}</p>
              </div>
              <div>
                <span className="text-md text-slate-500">{t('detail.gender')}</span>
                <p className="font-bold">{user.gender || '—'}</p>
              </div>
              <div>
                <span className="text-md text-slate-500">{t('detail.dateOfBirth')}</span>
                <p className="font-bold">{user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</p>
              </div>
              <div>
                <span className="text-md text-slate-500">{t('detail.createdAt')}</span>
                <p className="font-bold">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <h3 className="text-md font-bold">{t('detail.phoneUpdateTitle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-md text-slate-500 mb-2">{t('detail.newPhone')}</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      placeholder={t('detail.newPhonePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-md text-slate-500 mb-2">{t('detail.changeReason')}</label>
                    <input
                      type="text"
                      value={phoneReason}
                      onChange={(e) => setPhoneReason(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      placeholder={t('detail.changeReasonPlaceholder')}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdatePhone}
                  disabled={updatingPhone}
                  size="md"
                >
                  {updatingPhone ? t('detail.savingPhone') : t('detail.savePhone')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
