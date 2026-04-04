import { useState, useEffect, useCallback } from 'react';
import { FiSave, FiSettings, FiCreditCard, FiTruck, FiCpu, FiTrendingUp, FiMousePointer, FiShoppingCart, FiCheck, FiLoader } from 'react-icons/fi';
import { Button, CustomSelect, Modal, ModalCancelButton, FormInput, SwitchToggle } from '@/components';
import { toast } from 'sonner';
import adminSettingService from '@/apis/services/adminSettingService';
import type { SettingResponse } from '@/types';
import type { SettingUpdateRequest } from '@/apis/services/adminSettingService';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Helper: lấy giá trị setting
  const val = useCallback((key: string, fallback = '') => settings[key] ?? fallback, [settings]);
  const bool = useCallback((key: string) => val(key) === 'true', [val]);
  const num = useCallback((key: string, fallback = 0) => Number(val(key)) || fallback, [val]);

  // Helper: cập nhật giá trị setting
  const set = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Load settings từ API
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
        toast.error('Không thể tải cấu hình hệ thống');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Lưu settings — chỉ gửi những key đã thay đổi
  const handleSave = async () => {
    const changed: SettingUpdateRequest[] = [];
    for (const key of Object.keys(settings)) {
      if (settings[key] !== original[key]) {
        changed.push({ settingKey: key, settingValue: settings[key] });
      }
    }
    if (changed.length === 0) {
      toast.info('Không có thay đổi nào để lưu');
      return;
    }
    setSaving(true);
    try {
      await adminSettingService.batchUpdate(changed);
      setOriginal({ ...settings });
      toast.success(`Đã lưu ${changed.length} cấu hình thành công!`);
    } catch {
      toast.error('Lưu cấu hình thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(settings).some(k => settings[k] !== original[k]);

  const renderToggle = (settingKey: string, tone: 'primary' | 'success' | 'blue' | 'slate' = 'primary') => (
    <SwitchToggle
      checked={bool(settingKey)}
      onChange={(checked) => set(settingKey, String(checked))}
      tone={tone}
    />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-3xl text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cài Đặt Hệ Thống & AI</h1>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          loading={saving}
          icon={<FiSave />}
          size="md"
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
              <FiSettings />
            </div>
            <h2 className="text-lg font-bold">Cấu hình chung</h2>
          </div>

          <div className="space-y-4">
            <FormInput label="Tên cửa hàng" type="text" value={val('SHOP_NAME')} onChange={(e) => set('SHOP_NAME', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Đơn vị tiền tệ</label>
                <CustomSelect
                  value={val('CURRENCY', 'VND')}
                  onChange={(v) => set('CURRENCY', v)}
                  options={[
                    { value: 'VND', label: 'VNĐ (Việt Nam Đồng)' },
                    { value: 'USD', label: 'USD (Đô la Mỹ)' }
                  ]}
                  className="w-full"
                />
              </div>
              <FormInput label="Thuế mặc định (%)" type="number" value={val('DEFAULT_TAX_PERCENT', '10')} onChange={(e) => set('DEFAULT_TAX_PERCENT', e.target.value)} />
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Bật áp dụng thuế</h3>
                  <p className="text-xs text-slate-500 mt-1">Tính thuế ở bước checkout và lưu snapshot vào đơn hàng.</p>
                </div>
                {renderToggle('TAX_ENABLED', 'primary')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Chế độ thuế</label>
                  <CustomSelect
                    value={val('TAX_MODE', 'INCLUDED')}
                    onChange={(v) => set('TAX_MODE', v)}
                    options={[
                      { value: 'INCLUDED', label: 'Đã gồm trong giá' },
                      { value: 'EXCLUDED', label: 'Cộng thêm vào tổng' }
                    ]}
                    className="w-full"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Áp thuế lên phí ship</h4>
                    <p className="text-xs text-slate-500 mt-1">Nếu tắt, chỉ tính thuế trên tiền hàng.</p>
                  </div>
                  {renderToggle('TAX_APPLY_ON_SHIPPING', 'primary')}
                </div>
              </div>
            </div>
            <FormInput label="Email liên hệ" type="email" value={val('SHOP_EMAIL')} onChange={(e) => set('SHOP_EMAIL', e.target.value)} />
            <FormInput label="Email hỗ trợ" type="email" value={val('SUPPORT_EMAIL')} onChange={(e) => set('SUPPORT_EMAIL', e.target.value)} />
            <FormInput label="Hotline" type="text" value={val('HOTLINE')} onChange={(e) => set('HOTLINE', e.target.value)} />
            <FormInput label="Địa chỉ" type="text" value={val('SHOP_ADDRESS')} onChange={(e) => set('SHOP_ADDRESS', e.target.value)} />
          </div>
        </div>

        {/* AI Dashboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                <FiCpu />
              </div>
              <h2 className="text-lg font-bold">AI Dashboard (ML Ops)</h2>
            </div>
            <Button
              onClick={() => setIsAiModalOpen(true)}
              variant="ghost"
              size="sm"
              className="text-indigo-600"
            >
              Cấu hình thuật toán
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">Recommendation Engine</h3>
                <p className="text-xs text-slate-500 mt-1">Hệ thống gợi ý sản phẩm tự động</p>
              </div>
              {renderToggle("RECOMMENDATION_ENABLED", "blue")}
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-sm">AI Content Generator</h3>
                <p className="text-xs text-slate-500 mt-1">Tự động tạo mô tả sản phẩm</p>
              </div>
              {renderToggle("AI_CONTENT_ENABLED", "blue")}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-indigo-500 mb-1 flex justify-center"><FiTrendingUp /></div>
                <div className="text-xl font-bold">—</div>
                <div className="text-xs text-slate-500">Lần gợi ý</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-blue-500 mb-1 flex justify-center"><FiMousePointer /></div>
                <div className="text-xl font-bold">—</div>
                <div className="text-xs text-slate-500">Tỷ lệ click</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                <div className="text-green-500 mb-1 flex justify-center"><FiShoppingCart /></div>
                <div className="text-xl font-bold">—</div>
                <div className="text-xs text-slate-500">Chuyển đổi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
              <FiCreditCard />
            </div>
            <h2 className="text-lg font-bold">Cấu hình Thanh toán</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'COD_ENABLED', title: 'Thanh toán khi nhận hàng (COD)', desc: 'Cho phép khách hàng thanh toán tiền mặt' },
              { key: 'VNPAY_ENABLED', title: 'Thanh toán qua VNPay', desc: 'Cổng thanh toán nội địa và quốc tế' },
              { key: 'MOMO_ENABLED', title: 'Thanh toán qua MoMo', desc: 'Ví điện tử phổ biến tại Việt Nam' },
              { key: 'BANK_TRANSFER_ENABLED', title: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản trực tiếp qua ngân hàng' },
            ].map(pm => (
              <div key={pm.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-sm">{pm.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pm.desc}</p>
                </div>
                {renderToggle(pm.key)}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
              <FiTruck />
            </div>
            <h2 className="text-lg font-bold">Cấu hình Vận chuyển</h2>
          </div>

          <div className="space-y-4">
            <FormInput label="Phí ship mặc định (VNĐ)" type="number" value={val('DEFAULT_SHIPPING_FEE', '30000')} onChange={(e) => set('DEFAULT_SHIPPING_FEE', e.target.value)} />
            <div className="space-y-2">
              <FormInput label="Ngưỡng Freeship (VNĐ)" type="number" value={val('FREE_SHIPPING_THRESHOLD', '500000')} onChange={(e) => set('FREE_SHIPPING_THRESHOLD', e.target.value)} />
              <p className="text-xs text-slate-500">Đơn hàng có giá trị lớn hơn hoặc bằng ngưỡng này sẽ được miễn phí vận chuyển.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Cấu hình Thuật toán Gợi ý"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsAiModalOpen(false)} />
            <Button onClick={() => setIsAiModalOpen(false)} icon={<FiCheck />} size="md">
              Đóng
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thuật toán cốt lõi</label>
            <CustomSelect
              value={val('ALGORITHM', 'COLLABORATIVE')}
              onChange={(v) => set('ALGORITHM', v)}
              options={[
                { value: 'COLLABORATIVE', label: 'Collaborative Filtering' },
                { value: 'CONTENT', label: 'Content-based Filtering' },
                { value: 'HYBRID', label: 'Hybrid MLOps Model' }
              ]}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Độ ưu tiên sản phẩm mới</label>
                <span className="text-indigo-600 font-bold">{num('NEW_PRODUCT_PRIORITY', 70)}%</span>
              </div>
              <input type="range" min="0" max="100" value={num('NEW_PRODUCT_PRIORITY', 70)} onChange={(e) => set('NEW_PRODUCT_PRIORITY', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Độ đa dạng gợi ý (Exploration)</label>
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
