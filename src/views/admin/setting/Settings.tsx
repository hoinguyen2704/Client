import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiSettings, FiCreditCard, FiTruck, FiCpu, FiTrendingUp, FiMousePointer, FiShoppingCart, FiCheck, FiLoader } from 'react-icons/fi';
import { Button, CustomSelect, FormInput, Modal, ModalCancelButton, SectionCard, SwitchToggle } from '@/components';
import { toast } from 'sonner';
import adminSettingService from '@/apis/services/adminSettingService';
import type { SettingResponse, SettingUpdateRequest } from '@/types';

export default function Settings() {
  const { t } = useTranslation('adminSettings');
  const AI_FEATURES_UNDER_DEVELOPMENT = true;
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const val = useCallback((key: string, fallback = '') => settings[key] ?? fallback, [settings]);
  const bool = useCallback((key: string) => val(key) === 'true', [val]);
  const num = useCallback((key: string, fallback = 0) => Number(val(key)) || fallback, [val]);

  const set = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminSettingService.getAll();
        const flat: Record<string, string> = {};
        if (res.data) {
          Object.values(res.data).flat().forEach((s: SettingResponse) => {
            flat[s.settingKey] = s.settingValue;
          });
        }
        const withDefaults: Record<string, string> = {
          ...flat,
          DEFAULT_TAX_PERCENT: flat.DEFAULT_TAX_PERCENT ?? '10',
          TAX_ENABLED: flat.TAX_ENABLED ?? 'true',
          TAX_MODE: flat.TAX_MODE ?? 'INCLUDED',
          TAX_APPLY_ON_SHIPPING: flat.TAX_APPLY_ON_SHIPPING ?? 'true',
        };
        setSettings(withDefaults);
        setOriginal(withDefaults);
      } catch {
        toast.error(t('loadError'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const handleSave = async () => {
    const changed: SettingUpdateRequest[] = [];
    for (const key of Object.keys(settings)) {
      if (settings[key] !== original[key]) {
        changed.push({ settingKey: key, settingValue: settings[key] });
      }
    }
    if (changed.length === 0) {
      toast.info(t('noChanges'));
      return;
    }
    setSaving(true);
    try {
      await adminSettingService.batchUpdate(changed);
      setOriginal({ ...settings });
      toast.success(t('saveSuccess', { count: changed.length }));
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(settings).some(k => settings[k] !== original[k]);
  const currencyOptions = [
    { value: 'VND', label: t('general.currencyVND') },
    { value: 'USD', label: t('general.currencyUSD') },
  ];
  const taxModeOptions = [
    { value: 'INCLUDED', label: t('general.taxModeIncluded') },
    { value: 'EXCLUDED', label: t('general.taxModeExcluded') },
  ];
  const paymentMethods = [
    { key: 'COD_ENABLED', title: t('payment.cod'), description: t('payment.codDesc') },
    { key: 'VNPAY_ENABLED', title: t('payment.vnpay'), description: t('payment.vnpayDesc') },
    { key: 'MOMO_ENABLED', title: t('payment.momo'), description: t('payment.momoDesc') },
    { key: 'BANK_TRANSFER_ENABLED', title: t('payment.bank'), description: t('payment.bankDesc') },
  ];

  const renderToggle = (
    settingKey: string,
    tone: 'primary' | 'success' | 'blue' | 'slate' = 'primary',
    disabled = false,
  ) => (
    <SwitchToggle
      checked={bool(settingKey)}
      onChange={(checked) => set(settingKey, String(checked))}
      disabled={disabled}
      tone={tone}
    />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('title')}</h1>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          loading={saving}
          icon={<FiSave />}
          size="md"
          className="w-full sm:w-auto"
        >
          {saving ? t('saving') : t('save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="space-y-4 sm:space-y-6">
          <SectionCard
            title={t('general.title')}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
                <FiSettings />
              </div>
            }
            headerSeparated
          >
            <div className="space-y-4">
              <FormInput label={t('general.storeName')} type="text" value={val('SHOP_NAME')} onChange={(e) => set('SHOP_NAME', e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-md font-medium text-body">{t('general.currency')}</label>
                  <CustomSelect
                    value={val('CURRENCY', 'VND')}
                    onChange={(v) => set('CURRENCY', v)}
                    options={currencyOptions}
                    className="w-full"
                  />
                </div>
                <FormInput label={t('general.defaultTax')} type="number" value={val('DEFAULT_TAX_PERCENT', '10')} onChange={(e) => set('DEFAULT_TAX_PERCENT', e.target.value)} />
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-md">{t('general.enableTax')}</h3>
                    <p className="text-sm text-muted mt-1">{t('general.enableTaxDesc')}</p>
                  </div>
                  {renderToggle('TAX_ENABLED', 'primary')}
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${!bool('TAX_ENABLED') ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                  <div className="space-y-2">
                    <label className="text-md font-medium text-body">{t('general.taxMode')}</label>
                    <CustomSelect
                      value={val('TAX_MODE', 'INCLUDED')}
                      onChange={(v) => set('TAX_MODE', v)}
                      options={taxModeOptions}
                      className="w-full"
                      disabled={!bool('TAX_ENABLED')}
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 flex items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-md">{t('general.taxOnShipping')}</h4>
                      <p className="text-sm text-muted mt-1">{t('general.taxOnShippingDesc')}</p>
                    </div>
                    {renderToggle('TAX_APPLY_ON_SHIPPING', 'primary', !bool('TAX_ENABLED'))}
                  </div>
                </div>
              </div>
              <FormInput label={t('general.contactEmail')} type="email" value={val('SHOP_EMAIL')} onChange={(e) => set('SHOP_EMAIL', e.target.value)} />
              <FormInput label={t('general.supportEmail')} type="email" value={val('SUPPORT_EMAIL')} onChange={(e) => set('SUPPORT_EMAIL', e.target.value)} />
              <FormInput label={t('general.hotline')} type="text" value={val('HOTLINE')} onChange={(e) => set('HOTLINE', e.target.value)} />
              <FormInput label={t('general.address')} type="text" value={val('SHOP_ADDRESS')} onChange={(e) => set('SHOP_ADDRESS', e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard
            title={t('ai.title')}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600">
                <FiCpu />
              </div>
            }
            action={
              <Button
                onClick={() => {
                  if (!AI_FEATURES_UNDER_DEVELOPMENT) setIsAiModalOpen(true);
                }}
                variant="ghost"
                size="sm"
                className="text-indigo-600"
                disabled={AI_FEATURES_UNDER_DEVELOPMENT}
              >
                {AI_FEATURES_UNDER_DEVELOPMENT ? t('ai.underDevelopment') : t('ai.configure')}
              </Button>
            }
            headerSeparated
          >
            <div className="relative">
              {AI_FEATURES_UNDER_DEVELOPMENT && (
                <div className="absolute inset-x-0 inset-y-[-10px] z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl p-4">
                  <div className="px-6 py-4 rounded-xl shadow-lg border border-amber-200 bg-amber-50 text-amber-700 font-medium flex items-center gap-2">
                    {t('ai.lockedMsg')}
                  </div>
                </div>
              )}

              <div className={`space-y-4 ${AI_FEATURES_UNDER_DEVELOPMENT ? 'pointer-events-none select-none' : ''}`}>
                <div className="flex items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="font-bold text-md">{t('ai.recommendation')}</h3>
                    <p className="text-sm text-muted mt-1">{t('ai.recommendationDesc')}</p>
                  </div>
                  {renderToggle('RECOMMENDATION_ENABLED', 'blue', false)}
                </div>

                <div className="flex items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="font-bold text-md">{t('ai.aiContent')}</h3>
                    <p className="text-sm text-muted mt-1">{t('ai.aiContentDesc')}</p>
                  </div>
                  {renderToggle('AI_CONTENT_ENABLED', 'blue', false)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                    <div className="text-indigo-500 mb-1 flex justify-center"><FiTrendingUp /></div>
                    <div className="text-xl font-bold">—</div>
                    <div className="text-sm text-muted">{t('ai.suggestions')}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                    <div className="text-blue-500 mb-1 flex justify-center"><FiMousePointer /></div>
                    <div className="text-xl font-bold">—</div>
                    <div className="text-sm text-muted">{t('ai.clickRate')}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                    <div className="text-green-500 mb-1 flex justify-center"><FiShoppingCart /></div>
                    <div className="text-xl font-bold">—</div>
                    <div className="text-sm text-muted">{t('ai.conversions')}</div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <SectionCard
            title={t('payment.title')}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
                <FiCreditCard />
              </div>
            }
            headerSeparated
          >
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.key} className="flex items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="font-bold text-md">{method.title}</h3>
                    <p className="text-sm text-muted mt-1">{method.description}</p>
                  </div>
                  {renderToggle(method.key)}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={t('shipping.title')}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xl text-orange-600">
                <FiTruck />
              </div>
            }
            headerSeparated
          >
            <div className="space-y-4">
              <FormInput
                label={`${t('shipping.defaultFee')} ${t('units.vnd')}`}
                type="number"
                value={val('DEFAULT_SHIPPING_FEE', '30000')}
                onChange={(e) => set('DEFAULT_SHIPPING_FEE', e.target.value)}
              />
              <div className="space-y-2">
                <FormInput
                  label={`${t('shipping.freeshipThreshold')} ${t('units.vnd')}`}
                  type="number"
                  value={val('FREE_SHIPPING_THRESHOLD', '500000')}
                  onChange={(e) => set('FREE_SHIPPING_THRESHOLD', e.target.value)}
                />
                <p className="text-sm text-muted">{t('shipping.freeshipDesc')}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <Modal
        open={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={t('aiModal.title')}
        footer={
          <>
            <ModalCancelButton onClick={() => setIsAiModalOpen(false)} />
            <Button onClick={() => setIsAiModalOpen(false)} icon={<FiCheck />} size="md">
              {t('aiModal.close')}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-md font-medium">{t('aiModal.coreAlgo')}</label>
            <CustomSelect
              value={val('ALGORITHM', 'COLLABORATIVE')}
              onChange={(v) => set('ALGORITHM', v)}
              options={[
                { value: 'COLLABORATIVE', label: t('aiModal.algoCollab') },
                { value: 'CONTENT', label: t('aiModal.algoContent') },
                { value: 'HYBRID', label: t('aiModal.algoHybrid') }
              ]}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-md">
                <label className="font-medium">{t('aiModal.newProductPriority')}</label>
                <span className="text-indigo-600 font-bold">{num('NEW_PRODUCT_PRIORITY', 70)}%</span>
              </div>
              <input type="range" min="0" max="100" value={num('NEW_PRODUCT_PRIORITY', 70)} onChange={(e) => set('NEW_PRODUCT_PRIORITY', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-md">
                <label className="font-medium">{t('aiModal.diversity')}</label>
                <span className="text-indigo-600 font-bold">{num('EXPLORATION_RATE', 30)}%</span>
              </div>
              <input type="range" min="0" max="100" value={num('EXPLORATION_RATE', 30)} onChange={(e) => set('EXPLORATION_RATE', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
