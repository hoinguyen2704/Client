import { useEffect, useState, useCallback } from "react";
import {
  FiCpu,
  FiSettings,
  FiRefreshCw,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiX,
  FiMessageCircle,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import chatbotService from "@/apis/services/chatbotService";
import type { ChatbotConfig } from "@/apis/services/chatbotService";

type EditableSection = "shopInfo" | "bot" | "ai";
import { CustomSelect, ConfirmDialog } from "@/components";

/*  Model options cho dropdown  */
const MODEL_OPTIONS = [
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { value: "gemini-2-flash-preview", label: "Gemini 2 Flash" },
];

export default function Chatbot() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "settings",
  );
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /*  Load config on mount  */
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatbotService.getConfig();
      setConfig(data);
      setDirty(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Không thể tải cấu hình chatbot"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  /*  Helpers: cập nhật config local  */
  const updateField = (
    section: EditableSection,
    key: string,
    value: unknown,
  ) => {
    if (!config) return;
    const currentSection = (config[section] || {}) as Record<string, unknown>;
    setConfig({
      ...config,
      [section]: { ...currentSection, [key]: value },
    });
    setDirty(true);
  };

  const updateTopLevel = (key: keyof ChatbotConfig, value: unknown) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    setDirty(true);
  };

  /*  Save  */
  const handleSave = async () => {
    if (!config || saving) return;
    try {
      setSaving(true);
      const result = await chatbotService.updateConfig(config);
      setConfig(result.config);
      setDirty(false);
      toast.success(result.message || "Cập nhật cấu hình thành công!");
    } catch (err: unknown) {
      toast.error(
        "Lỗi lưu cấu hình: " +
          getApiErrorMessage(err, "Lưu cấu hình thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  /*  Reset  */
  const handleReset = async () => {
    setShowResetConfirm(false);
    try {
      setSaving(true);
      const result = await chatbotService.resetConfig();
      setConfig(result.config);
      setDirty(false);
      toast.success(result.message || "Đã khôi phục mặc định!");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Lỗi khôi phục"));
    } finally {
      setSaving(false);
    }
  };

  /*  Suggestions CRUD  */
  const addSuggestion = () => {
    if (!config || !newSuggestion.trim()) return;
    updateTopLevel("suggestions", [
      ...(config.suggestions || []),
      newSuggestion.trim(),
    ]);
    setNewSuggestion("");
  };

  const removeSuggestion = (idx: number) => {
    if (!config) return;
    updateTopLevel(
      "suggestions",
      config.suggestions.filter((_, i) => i !== idx),
    );
  };

  /*  Loading / Error states  */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <FiRefreshCw className="animate-spin text-xl" /> Đang tải cấu hình...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
        <FiAlertTriangle className="text-4xl" />
        <p>Không thể kết nối đến Chatbot Server</p>
        <button
          onClick={loadConfig}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FiCpu className="text-purple-600" /> Quản lý AI Chatbot
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Powered by Gemini AI — Model: {config.ai?.model}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={saving}
            className="px-4 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
          >
            <FiRefreshCw className={saving ? "animate-spin" : ""} /> Khôi phục
            mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 h-10 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
          >
            <FiSave /> {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </div>

      {/* Unsaved indicator */}
      {dirty && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <FiAlertTriangle /> Có thay đổi chưa lưu
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}
        >
          <FiSettings className="inline mr-1.5 -mt-0.5" />
          Cấu hình
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "overview" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}
        >
          <FiActivity className="inline mr-1.5 -mt-0.5" />
          Tổng quan
        </button>
      </div>

      {/* ═══════════ TAB: CẤU HÌNH ═══════════ */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/*  Cột trái: 2/3  */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Card: Thông tin cửa hàng */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-1">🏪 Thông tin cửa hàng</h2>
              <p className="text-xs text-slate-500 mb-5">
                Thông tin này được nhúng vào System Prompt để bot giới thiệu cho
                khách.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Tên cửa hàng
                  </label>
                  <input
                    type="text"
                    value={config.shopInfo?.name || ""}
                    onChange={(e) =>
                      updateField("shopInfo", "name", e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={config.shopInfo?.slogan || ""}
                    onChange={(e) =>
                      updateField("shopInfo", "slogan", e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={config.shopInfo?.address || ""}
                    onChange={(e) =>
                      updateField("shopInfo", "address", e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Hotline
                  </label>
                  <input
                    type="text"
                    value={config.shopInfo?.hotline || ""}
                    onChange={(e) =>
                      updateField("shopInfo", "hotline", e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Email hỗ trợ
                  </label>
                  <input
                    type="text"
                    value={config.shopInfo?.email || ""}
                    onChange={(e) =>
                      updateField("shopInfo", "email", e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Website
                  </label>
                  <input
                    type="text"
                    value={config.shopInfo?.website || ""}
                    onChange={(e) =>
                      updateField("shopInfo", "website", e.target.value)
                    }
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Card: Cấu hình AI */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold mb-1">🧠 Cấu hình AI</h2>
              <p className="text-xs text-slate-500 mb-5">
                Điều chỉnh model, nhiệt độ sáng tạo, và quy tắc hành vi bot.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Model AI
                  </label>
                  <CustomSelect
                    value={config.ai?.model || ""}
                    onChange={(val) => updateField("ai", "model", val)}
                    options={MODEL_OPTIONS}
                    className="w-full h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Temperature:{" "}
                    <span className="text-purple-600 font-bold">
                      {config.ai?.temperature ?? 0.7}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.ai?.temperature ?? 0.7}
                    onChange={(e) =>
                      updateField(
                        "ai",
                        "temperature",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full mt-2 accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0 — Chính xác</span>
                    <span>1 — Sáng tạo</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  System Prompt (Quy tắc hành vi)
                </label>
                <textarea
                  value={config.ai?.systemRules || ""}
                  onChange={(e) =>
                    updateField("ai", "systemRules", e.target.value)
                  }
                  rows={8}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-y font-mono leading-relaxed"
                  placeholder="Nhập các quy tắc cho chatbot..."
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Mỗi dòng bắt đầu bằng «-» là 1 quy tắc. Thay đổi sẽ ảnh hưởng
                  trực tiếp đến cách bot trả lời.
                </p>
              </div>

              {/* Runtime Parameters */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  ⚙️ Thông số vận hành
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Số sản phẩm tối đa / lần trả lời
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={config.ai?.maxProducts ?? 3}
                      onChange={(e) =>
                        updateField(
                          "ai",
                          "maxProducts",
                          Math.max(
                            1,
                            Math.min(20, parseInt(e.target.value) || 3),
                          ),
                        )
                      }
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Mặc định: 3. Giới hạn sản phẩm hiển thị trong mỗi câu trả
                      lời.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Số lần retry khi AI lỗi
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={config.ai?.maxRetries ?? 1}
                      onChange={(e) =>
                        updateField(
                          "ai",
                          "maxRetries",
                          Math.max(
                            0,
                            Math.min(5, parseInt(e.target.value) || 1),
                          ),
                        )
                      }
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Mặc định: 1. Số lần thử lại khi Gemini API timeout/lỗi.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Timeout AI phân tích (ms)
                    </label>
                    <input
                      type="number"
                      min={5000}
                      max={60000}
                      step={1000}
                      value={config.ai?.planTimeoutMs ?? 25000}
                      onChange={(e) =>
                        updateField(
                          "ai",
                          "planTimeoutMs",
                          Math.max(
                            5000,
                            Math.min(60000, parseInt(e.target.value) || 25000),
                          ),
                        )
                      }
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Mặc định: 25000ms. Thời gian chờ AI phân tích câu hỏi.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Timeout truy vấn DB (ms)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={30000}
                      step={1000}
                      value={config.ai?.dbTimeoutMs ?? 6000}
                      onChange={(e) =>
                        updateField(
                          "ai",
                          "dbTimeoutMs",
                          Math.max(
                            1000,
                            Math.min(30000, parseInt(e.target.value) || 6000),
                          ),
                        )
                      }
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Mặc định: 6000ms. Thời gian chờ truy vấn database.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  Cột phải: 1/3  */}
          <div className="space-y-4 sm:space-y-6">
            {/* Card: Bật/Tắt chatbot */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Trạng thái Chatbot</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {config.isEnabled
                      ? "Chatbot đang hoạt động trên trang khách hàng"
                      : "Chatbot đang tắt — khách hàng không thấy widget"}
                  </p>
                </div>
                <button
                  onClick={() => updateTopLevel("isEnabled", !config.isEnabled)}
                  className={`text-3xl transition-colors ${config.isEnabled ? "text-green-500" : "text-slate-300 dark:text-slate-600"}`}
                  title={config.isEnabled ? "Tắt chatbot" : "Bật chatbot"}
                >
                  {config.isEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>
            </div>

            {/* Card: Giao diện Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h2 className="text-lg font-bold">🎨 Giao diện Widget</h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Tên Bot
                </label>
                <input
                  type="text"
                  value={config.bot?.name || ""}
                  onChange={(e) => updateField("bot", "name", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={config.bot?.subtitle || ""}
                  onChange={(e) =>
                    updateField("bot", "subtitle", e.target.value)
                  }
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Màu sắc chủ đạo
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.bot?.themeColor || "#9333ea"}
                    onChange={(e) =>
                      updateField("bot", "themeColor", e.target.value)
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.bot?.themeColor || "#9333ea"}
                    onChange={(e) =>
                      updateField("bot", "themeColor", e.target.value)
                    }
                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Avatar Bot
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
                    {config.bot?.avatarUrl ? (
                      <img
                        src={config.bot.avatarUrl}
                        alt="Bot"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiCpu className="text-2xl text-purple-500" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={config.bot?.avatarUrl || ""}
                    onChange={(e) =>
                      updateField("bot", "avatarUrl", e.target.value)
                    }
                    placeholder="URL ảnh avatar..."
                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Card: Tin nhắn chào mừng */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h2 className="text-lg font-bold">💬 Tin nhắn chào mừng</h2>
              <textarea
                value={config.bot?.welcomeMessage || ""}
                onChange={(e) =>
                  updateField("bot", "welcomeMessage", e.target.value)
                }
                rows={5}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-y"
                placeholder="Tin nhắn chào khách khi mở chatbot..."
              />
              <p className="text-xs text-slate-500">
                Hỗ trợ Markdown: **bold**, *italic*, - danh sách
              </p>
            </div>

            {/* Card: Gợi ý nhanh */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-lg font-bold">
                ⚡ Gợi ý nhanh (Quick Suggestions)
              </h2>
              <p className="text-xs text-slate-500">
                Các chip gợi ý hiển thị dưới tin nhắn chào.
              </p>

              <div className="space-y-2">
                {config.suggestions?.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => {
                        const newSugg = [...(config.suggestions || [])];
                        newSugg[idx] = e.target.value;
                        updateTopLevel("suggestions", newSugg);
                      }}
                      className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <button
                      onClick={() => removeSuggestion(idx)}
                      className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSuggestion()}
                  placeholder="Thêm gợi ý mới..."
                  className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
                <button
                  onClick={addSuggestion}
                  disabled={!newSuggestion.trim()}
                  className="h-10 px-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-1 w-full sm:w-auto"
                >
                  <FiPlus /> Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TAB: TỔNG QUAN ═══════════ */}
      {activeTab === "overview" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Stats Cards - placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Trạng thái
                  </p>
                  <h3 className="text-xl font-bold">
                    {config.isEnabled ? (
                      <span className="text-green-500 flex items-center gap-2">
                        <FiCheckCircle /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="text-red-500">Đã tắt</span>
                    )}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                  <FiMessageCircle />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Model AI
                  </p>
                  <h3 className="text-lg font-bold">
                    {config.ai?.model || "N/A"}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                  <FiCpu />
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Temperature: {config.ai?.temperature ?? "N/A"}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Cửa hàng
                  </p>
                  <h3 className="text-lg font-bold">
                    {config.shopInfo?.name || "N/A"}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                  <FiCheckCircle />
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Hotline: {config.shopInfo?.hotline || "N/A"}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Gợi ý nhanh
                  </p>
                  <h3 className="text-2xl font-bold">
                    {config.suggestions?.length ?? 0}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                  <FiClock />
                </div>
              </div>
              <div className="text-sm text-slate-500">
                suggestions đang hoạt động
              </div>
            </div>
          </div>

          {/* Current config summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">
              📋 Cấu hình hiện tại (JSON)
            </h2>
            <pre className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={showResetConfirm}
        title="Khôi phục mặc định"
        message="Bạn có chắc muốn khôi phục toàn bộ cấu hình về mặc định? Hành động này không thể hoàn tác."
        confirmLabel="Khôi phục"
        variant="warning"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
