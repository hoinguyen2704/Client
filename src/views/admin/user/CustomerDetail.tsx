import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiCalendar, FiLoader, FiLock, FiMail, FiPhone, FiSave, FiUploadCloud, FiUnlock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import adminUserService from '@/apis/services/adminUserService';
import { BackButton, Button, CustomSelect, StatusBadge, UserAvatar } from '@/components';
import useAuthStore from '@/stores/useAuthStore';
import type { UserResponse } from '@/types';
import { getApiErrorMessage } from '@/utils/error';
import { formatDate } from '@/utils/format';

type CustomerFormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  role: string;
  avatarUrl: string;
  password: string;
  confirmPassword: string;
  changeReason: string;
};

const EMPTY_FORM: CustomerFormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  role: 'USER',
  avatarUrl: '',
  password: '',
  confirmPassword: '',
  changeReason: '',
};

export default function CustomerDetail() {
  const { t } = useTranslation(['adminCustomers', 'common']);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));
  const isCreateMode = location.pathname.endsWith('/customers/new');
  const isAdminAccount = user?.role === 'ADMIN';
  const isCurrentUserAccount = !!user && !!currentUserId && user.id === currentUserId;
  const canEditTarget = isCreateMode || !isAdminAccount || isCurrentUserAccount;
  const canUploadAvatar = canEditTarget;
  const compactPhoneNumber = form.phoneNumber.trim().replaceAll(/[\s().-]/g, '');
  const currentCompactPhoneNumber = (user?.phoneNumber || '').trim().replaceAll(/[\s().-]/g, '');
  const isPhoneValid = !form.phoneNumber.trim() || /^(0|\+84|84)[35789][0-9]{8}$/.test(compactPhoneNumber);
  const hasProfileChanges = !!user && (
    form.fullName.trim() !== (user.fullName || '').trim()
    || compactPhoneNumber !== currentCompactPhoneNumber
    || form.dateOfBirth !== (user.dateOfBirth || '')
    || form.gender !== (user.gender || '')
    || form.avatarUrl !== (user.avatarUrl || '')
  );
  const canSaveProfile = !!user
    && canEditTarget
    && hasProfileChanges
    && !!form.fullName.trim()
    && !!form.changeReason.trim()
    && isPhoneValid
    && !uploadingAvatar
    && !submitting;

  const syncFormWithUser = (nextUser: UserResponse) => {
    setForm({
      fullName: nextUser.fullName || '',
      email: nextUser.email || '',
      phoneNumber: nextUser.phoneNumber || '',
      dateOfBirth: nextUser.dateOfBirth || '',
      gender: nextUser.gender || '',
      role: nextUser.role || 'USER',
      avatarUrl: nextUser.avatarUrl || '',
      password: '',
      confirmPassword: '',
      changeReason: '',
    });
  };

  useEffect(() => {
    if (isCreateMode) {
      setUser(null);
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }
    if (!id) return;

    setLoading(true);
    adminUserService.getById(id)
      .then((res) => {
        setUser(res.data);
        syncFormWithUser(res.data);
      })
      .catch((err) => {
        console.error('Failed to load user:', err);
      })
      .finally(() => setLoading(false));
  }, [id, isCreateMode]);

  const displayName = isCreateMode
    ? (form.fullName.trim() || t('detail.newCustomerFallbackName'))
    : (form.fullName.trim() || user?.fullName || '—');
  const displayEmail = isCreateMode ? (form.email.trim() || '—') : (user?.email || '—');
  const displayPhoneNumber = isCreateMode
    ? (form.phoneNumber.trim() || '—')
    : (form.phoneNumber.trim() || user?.phoneNumber || '—');
  const displayAvatarUrl = form.avatarUrl || user?.avatarUrl || '';
  const resolvedGenderLabel = !user?.gender
    ? '—'
    : user.gender === 'MALE'
      ? t('detail.genderOptions.male')
      : user.gender === 'FEMALE'
        ? t('detail.genderOptions.female')
        : user.gender === 'OTHER'
          ? t('detail.genderOptions.other')
          : user.gender;

  const handleToggle = async () => {
    if (!user) return;
    try {
      const res = await adminUserService.toggleStatus(user.id);
      setUser(res.data);
      syncFormWithUser(res.data);
      toast.success(t('detail.toasts.toggleSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    } catch (err) {
      console.error(err);
      toast.error(t('detail.toasts.toggleFailed'));
    }
  };

  const handleReset = () => {
    if (isCreateMode) {
      setForm(EMPTY_FORM);
      return;
    }
    if (!user) return;
    syncFormWithUser(user);
  };

  const handleAvatarSelected = async (file?: File) => {
    if (!file || !canUploadAvatar) return;

    setUploadingAvatar(true);
    try {
      const res = await adminUserService.uploadAvatar(file);
      setForm((current) => ({ ...current, avatarUrl: res.data.avatarUrl }));
      toast.success(t('detail.toasts.avatarUploaded'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, translate, 'adminCustomers:detail.toasts.avatarUploadFailed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!form.fullName.trim()) {
      toast.error(t('customers.toasts.fullNameRequired'));
      return;
    }
    if (!form.email.trim()) {
      toast.error(t('customers.toasts.emailRequired'));
      return;
    }
    if (!form.phoneNumber.trim()) {
      toast.error(t('customers.toasts.phoneRequired'));
      return;
    }
    if (!isPhoneValid) {
      toast.error(t('customers.toasts.phoneInvalid'));
      return;
    }
    if (!form.password) {
      toast.error(t('customers.toasts.passwordRequired'));
      return;
    }
    if (form.password.length < 6) {
      toast.error(t('customers.toasts.passwordMin'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error(t('customers.toasts.confirmPasswordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminUserService.createCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        role: form.role || 'USER',
        avatarUrl: form.avatarUrl || null,
      });
      toast.success(t('customers.toasts.createSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      navigate(`/admin/customers/${res.data.id}`, { replace: true });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, translate, 'adminCustomers:customers.toasts.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!canEditTarget) {
      toast.error(t('detail.toasts.onlySelfEditable'));
      return;
    }
    if (!form.fullName.trim()) {
      toast.error(t('detail.toasts.fullNameRequired'));
      return;
    }
    if (form.phoneNumber.trim() && !isPhoneValid) {
      toast.error(t('detail.toasts.phoneInvalid'));
      return;
    }
    if (!form.changeReason.trim()) {
      toast.error(t('detail.toasts.reasonRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminUserService.updateProfile(user.id, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        avatarUrl: form.avatarUrl || null,
        reason: form.changeReason.trim(),
      });
      setUser(res.data);
      syncFormWithUser(res.data);
      if (isCurrentUserAccount) {
        useAuthStore.getState().updateUser({
          name: res.data.fullName,
          avatar: res.data.avatarUrl,
        });
      }
      toast.success(t('detail.toasts.profileUpdated'));
      await queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, translate, 'adminCustomers:detail.toasts.profileUpdateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackButton to="/admin/customers" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="animate-pulse rounded-2xl bg-white p-4 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isCreateMode && !user) {
    return <div className="p-8 text-center text-ink">{t('detail.notFound')}</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton to="/admin/customers" />
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {isCreateMode ? t('detail.createPageTitle') : t('detail.title')}
          </h1>
          {isCreateMode ? (
            <p className="mt-1 text-sm text-muted">{t('detail.createPageDescription')}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="relative mb-4 inline-block">
              {displayAvatarUrl ? (
                <img
                  src={displayAvatarUrl}
                  alt={displayName}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md dark:border-slate-800"
                />
              ) : (
                <UserAvatar
                  name={displayName}
                  size="xl"
                  className="border-4 border-white shadow-md dark:border-slate-800"
                />
              )}
              {!isCreateMode ? (
                <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 ${user?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
              ) : null}
            </div>

            <h2 className="mb-1 text-lg font-bold sm:text-xl">{displayName}</h2>
            <p className="mb-4 text-md text-ink">
              {isCreateMode ? t('detail.createHandleHint') : `@${user?.userName || displayEmail.split('@')[0]}`}
            </p>

            <div className="mb-5 flex justify-center gap-2 sm:mb-6">
              <StatusBadge
                status={isCreateMode || user?.status === 'ACTIVE' ? 'active' : 'banned'}
                label={isCreateMode || user?.status === 'ACTIVE' ? t('customers.statuses.active') : t('customers.statuses.locked')}
              />
              <StatusBadge status={isCreateMode ? (form.role === 'ADMIN' ? 'admin' : 'user') : (user?.role === 'USER' ? 'user' : 'admin')} />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                void handleAvatarSelected(file);
                event.currentTarget.value = '';
              }}
            />

            {canUploadAvatar ? (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="md"
                fullWidth
                icon={uploadingAvatar ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
                disabled={uploadingAvatar || submitting}
              >
                {uploadingAvatar
                  ? t('detail.uploadingAvatar')
                  : displayAvatarUrl
                    ? t('detail.changeAvatar')
                    : t('detail.uploadAvatar')}
              </Button>
            ) : null}

            {!isCreateMode ? (
              <Button
                onClick={handleToggle}
                variant={user?.status === 'ACTIVE' ? 'danger' : 'success'}
                size="md"
                fullWidth
                className={canUploadAvatar ? 'mt-3' : ''}
                icon={user?.status === 'ACTIVE' ? <FiLock /> : <FiUnlock />}
                disabled={isAdminAccount}
              >
                {isAdminAccount
                  ? t('detail.adminReadonlyAction')
                  : user?.status === 'ACTIVE'
                    ? t('customers.actions.lock')
                    : t('customers.actions.unlock')}
              </Button>
            ) : null}

            <div className="mt-5 space-y-3 text-left text-md sm:mt-6">
              <div className="flex items-center gap-3 text-body text-lg">
                <FiMail className="shrink-0 text-subtle" />
                <span className="truncate">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-body text-lg">
                <FiPhone className="shrink-0 text-subtle" />
                <span>{displayPhoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-body text-lg">
                <FiCalendar className="shrink-0 text-subtle" />
                <span>
                  {isCreateMode
                    ? t('detail.avatarHint')
                    : t('detail.joined', { date: formatDate(user?.createdAt) })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 p-4 dark:border-slate-800 sm:p-6">
              <h2 className="text-lg font-bold">
                {isCreateMode ? t('customers.createModal.title') : t('detail.accountInfo')}
              </h2>
            </div>

            {!isCreateMode ? (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
                <div>
                  <span className="text-md text-muted">{t('detail.fullName')}</span>
                  <p className="font-bold">{user?.fullName}</p>
                </div>
                <div>
                  <span className="text-md text-muted">{t('detail.email')}</span>
                  <p className="font-bold">{user?.email}</p>
                </div>
                <div>
                  <span className="text-md text-muted">{t('detail.phone')}</span>
                  <p className="font-bold">{user?.phoneNumber || '—'}</p>
                </div>
                <div>
                  <span className="text-md text-muted">{t('detail.gender')}</span>
                  <p className="font-bold">{resolvedGenderLabel}</p>
                </div>
                <div>
                  <span className="text-md text-muted">{t('detail.dateOfBirth')}</span>
                  <p className="font-bold">{user?.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</p>
                </div>
                <div>
                  <span className="text-md text-muted">{t('detail.createdAt')}</span>
                  <p className="font-bold">{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
                </div>
              </div>
            ) : null}

            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              {!isCreateMode && !canEditTarget ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-md text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  {t('detail.readonlyOtherAccountNotice')}
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <h3 className="text-md font-bold">
                    {isCreateMode ? t('detail.createProfileTitle') : t('detail.profileEditTitle')}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={isCreateMode ? '' : 'sm:col-span-1'}>
                      <label className="mb-2 block text-md text-muted">{t('detail.fullName')}</label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
                        placeholder={t('detail.fullNamePlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-md text-muted">{t('detail.email')}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
                        placeholder={t('detail.emailPlaceholder')}
                        disabled={!isCreateMode}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-md text-muted">{t('detail.phone')}</label>
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm((current) => ({ ...current, phoneNumber: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
                        placeholder={t('detail.newPhonePlaceholder')}
                      />
                      <p className="mt-2 text-sm text-muted">{t('detail.phoneFormatHint')}</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-md text-muted">{t('detail.dateOfBirth')}</label>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm((current) => ({ ...current, dateOfBirth: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="mb-2 block text-md text-muted">{t('detail.gender')}</label>
                      <CustomSelect
                        value={form.gender}
                        onChange={(value) => setForm((current) => ({ ...current, gender: value }))}
                        className="h-11 w-full"
                        options={[
                          { value: '', label: t('detail.genderOptions.unset') },
                          { value: 'MALE', label: t('detail.genderOptions.male') },
                          { value: 'FEMALE', label: t('detail.genderOptions.female') },
                          { value: 'OTHER', label: t('detail.genderOptions.other') },
                        ]}
                      />
                    </div>

                    {isCreateMode && (
                      <div className="sm:col-span-1">
                        <label className="mb-2 block text-md text-muted">{t('customers.createModal.fields.role')}</label>
                        <CustomSelect
                          value={form.role}
                          onChange={(value) => setForm((current) => ({ ...current, role: value }))}
                          className="h-11 w-full"
                          options={[
                            { value: 'USER', label: t('customers.createModal.roleOptions.user') },
                            { value: 'ADMIN', label: t('customers.createModal.roleOptions.admin') },
                          ]}
                        />
                      </div>
                    )}

                    {isCreateMode ? (
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-md text-muted">{t('customers.createModal.fields.password')}</label>
                          <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
                            placeholder={t('customers.createModal.placeholders.password')}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-md text-muted">{t('customers.createModal.fields.confirmPassword')}</label>
                          <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
                            placeholder={t('customers.createModal.placeholders.confirmPassword')}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-md text-muted">{t('detail.changeReason')}</label>
                        <textarea
                          value={form.changeReason}
                          onChange={(e) => setForm((current) => ({ ...current, changeReason: e.target.value }))}
                          className="min-h-[104px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
                          placeholder={t('detail.changeReasonPlaceholder')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={isCreateMode ? handleCreateCustomer : handleUpdateProfile}
                      disabled={isCreateMode ? (submitting || uploadingAvatar) : !canSaveProfile}
                      loading={submitting}
                      size="md"
                      icon={<FiSave />}
                    >
                      {isCreateMode
                        ? (submitting ? t('customers.createModal.creating') : t('customers.createModal.submit'))
                        : (submitting ? t('detail.savingProfile') : t('detail.saveProfile'))}
                    </Button>
                    <Button
                      onClick={handleReset}
                      disabled={submitting || uploadingAvatar}
                      size="md"
                      variant="secondary"
                    >
                      {isCreateMode ? t('detail.resetCreate') : t('detail.resetProfile')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
