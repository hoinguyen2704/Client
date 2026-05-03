import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import {
  ConfirmDialog,
  FormInput,
  FormTextarea,
  SearchableDropdown,
  SectionCard,
} from "@/components";
import type {
  ChatbotConfig,
  ChatbotModelCatalogResponse,
  ChatbotModelOption,
} from "@/types";
import ChatbotOverviewStatCard from "./components/ChatbotOverviewStatCard";

type EditableSection = "shopInfo" | "bot" | "ai";
type AIProvider = NonNullable<ChatbotConfig["ai"]["provider"]>;

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
};

const buildModelOptions = (
  catalog: ChatbotModelCatalogResponse | null,
  currentModel: string,
  currentProvider?: AIProvider,
  configModels: ChatbotModelOption[] = [],
) => {
  const options: ChatbotModelOption[] = [];
  const seen = new Set<string>();

  const appendOption = (option?: ChatbotModelOption | null) => {
    const value = String(option?.value || "").trim();
    if (!value || seen.has(value)) return;

    seen.add(value);
    options.push({
      value,
      label: option?.label || value,
      provider: option?.provider,
      source: option?.source,
    });
  };

  appendOption(
    currentModel
      ? { value: currentModel, label: currentModel, provider: currentProvider }
      : null,
  );

  for (const option of catalog?.models || []) {
    appendOption(option);
  }

  for (const option of configModels || []) {
    appendOption(option);
  }

  return options;
};

const buildProviderOptions = (
  catalog: ChatbotModelCatalogResponse | null,
  currentProvider?: AIProvider,
) => {
  const providers = new Set<AIProvider>();

  if (currentProvider) {
    providers.add(currentProvider);
  }

  for (const option of catalog?.models || []) {
    if (option.provider === "openai" || option.provider === "gemini") {
      providers.add(option.provider);
    }
  }

  return [...providers].map((provider) => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
  }));
};

export default function Chatbot() {
  const { t } = useTranslation("adminSupport");
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "settings",
  );
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [modelCatalog, setModelCatalog] =
    useState<ChatbotModelCatalogResponse | null>(null);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const translate = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      String(t(key, options as never)),
    [t],
  );

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatbotService.getConfig();
      setConfig(data);
      setDirty(false);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          translate,
          "adminSupport:chatbot.toasts.loadFailed",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [translate]);

  const loadModelCatalog = useCallback(async () => {
    try {
      setLoadingModels(true);
      const data = await chatbotService.getModels();
      setModelCatalog(data);
    } catch (err) {
      console.error("[ADMIN] load chatbot models failed:", err);
      setModelCatalog(null);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const refreshPageData = useCallback(() => {
    void loadConfig();
    void loadModelCatalog();
  }, [loadConfig, loadModelCatalog]);

  useEffect(() => {
    refreshPageData();
  }, [refreshPageData]);

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

  const updateProvider = (providerValue: string) => {
    if (!config) return;
    const provider = providerValue as AIProvider;
    const nextModelOptions = modelOptions.filter(
      (option) => option.provider === provider,
    );
    const nextModel = nextModelOptions.some(
      (option) => option.value === config.ai?.model,
    )
      ? config.ai.model
      : (nextModelOptions[0]?.value ?? config.ai?.model ?? "");

    setConfig({
      ...config,
      ai: {
        ...config.ai,
        provider,
        model: nextModel,
      },
    });
    setDirty(true);
  };

  const updateModel = (model: string) => {
    if (!config) return;
    const selectedOption =
      filteredModelOptions.find((option) => option.value === model) ||
      modelOptions.find((option) => option.value === model);

    setConfig({
      ...config,
      ai: {
        ...config.ai,
        model,
        provider: selectedOption?.provider || config.ai?.provider,
      },
    });
    setDirty(true);
  };

  const createModel = (modelName: string) => {
    if (!config) return;

    const value = String(modelName || "").trim().replace(/^models\//i, "");
    if (!value) return;

    const provider = (selectedProvider || config.ai?.provider || "openai") as AIProvider;
    const currentModels = Array.isArray(config.ai?.availableModels)
      ? config.ai.availableModels
      : [];
    const alreadyExists = currentModels.some(
      (option) => option.value.trim().toLowerCase() === value.toLowerCase(),
    );

    setConfig({
      ...config,
      ai: {
        ...config.ai,
        provider,
        model: value,
        availableModels: alreadyExists
          ? currentModels
          : [
              ...currentModels,
              {
                value,
                label: value,
                provider,
                source: "defined",
              },
            ],
      },
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!config || saving) return;
    try {
      setSaving(true);
      const result = await chatbotService.updateConfig(config);
      setConfig(result.config);
      setDirty(false);
      toast.success(result.message || t("chatbot.toasts.saveSuccess"));
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          translate,
          "adminSupport:chatbot.toasts.saveFailed",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    try {
      setSaving(true);
      const result = await chatbotService.resetConfig();
      setConfig(result.config);
      setDirty(false);
      toast.success(result.message || t("chatbot.toasts.resetSuccess"));
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          translate,
          "adminSupport:chatbot.toasts.resetFailed",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-subtle">
        <FiRefreshCw className="animate-spin text-xl" />
        {t("chatbot.states.loading")}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
        <FiAlertTriangle className="text-4xl" />
        <p>{t("chatbot.states.connectionFailed")}</p>
        <button
          onClick={refreshPageData}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-md"
        >
          {t("chatbot.actions.retry")}
        </button>
      </div>
    );
  }

  const notAvailable = t("chatbot.overview.notAvailable");
  const currentModel = config.ai?.model || notAvailable;
  const storeName = config.shopInfo?.name || notAvailable;
  const hotline = config.shopInfo?.hotline || notAvailable;
  const suggestionsCount = config.suggestions?.length ?? 0;
  const modelOptions = buildModelOptions(
    modelCatalog,
    config.ai?.model || "",
    config.ai?.provider,
    config.ai?.availableModels || [],
  );
  const providerOptions = buildProviderOptions(modelCatalog, config.ai?.provider);
  const selectedProvider = config.ai?.provider || providerOptions[0]?.value || "";
  const filteredModelOptions = modelOptions.filter(
    (option) => !selectedProvider || option.provider === selectedProvider,
  );
  const providerDropdownItems = providerOptions.map((option) => ({
    id: option.value,
    name: option.label,
  }));
  const modelDropdownItems = filteredModelOptions.map((option) => ({
    id: option.value,
    name: option.label,
  }));
  const modelCatalogHint = loadingModels
    ? t("chatbot.sections.ai.modelCatalogLoading")
    : modelCatalog?.source === "defined"
      ? t("chatbot.sections.ai.modelCatalogDefined")
      : t("chatbot.sections.ai.modelCatalogFallback");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FiCpu className="text-blue-600" />
            {t("chatbot.title")}
          </h1>
          <p className="text-md text-muted mt-1">
            {t("chatbot.subtitle", { model: currentModel })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={saving}
            className="px-4 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-muted font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-md flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
          >
            <FiRefreshCw className={saving ? "animate-spin" : ""} />
            {t("chatbot.actions.reset")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 h-10 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-md flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
          >
            <FiSave />
            {saving ? t("chatbot.actions.saving") : t("chatbot.actions.save")}
          </button>
        </div>
      </div>

      {dirty && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-md flex items-center gap-2">
          <FiAlertTriangle />
          {t("chatbot.states.dirty")}
        </div>
      )}

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 sm:px-6 py-3 font-medium text-md border-b-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-blue-600 text-blue-600" : "border-transparent text-muted hover:text-ink"}`}
        >
          <FiSettings className="inline mr-1.5 -mt-0.5" />
          {t("chatbot.tabs.settings")}
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 sm:px-6 py-3 font-medium text-md border-b-2 transition-colors whitespace-nowrap ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-muted hover:text-ink"}`}
        >
          <FiActivity className="inline mr-1.5 -mt-0.5" />
          {t("chatbot.tabs.overview")}
        </button>
      </div>

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <SectionCard
              title={`🏪 ${t("chatbot.sections.shopInfo.title")}`}
              description={t("chatbot.sections.shopInfo.description")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label={t("chatbot.sections.shopInfo.fields.name")}
                  value={config.shopInfo?.name || ""}
                  onChange={(e) => updateField("shopInfo", "name", e.target.value)}
                  inputClassName="h-11"
                />
                <FormInput
                  label={t("chatbot.sections.shopInfo.fields.slogan")}
                  value={config.shopInfo?.slogan || ""}
                  onChange={(e) => updateField("shopInfo", "slogan", e.target.value)}
                  inputClassName="h-11"
                />
                <FormInput
                  label={t("chatbot.sections.shopInfo.fields.address")}
                  value={config.shopInfo?.address || ""}
                  onChange={(e) => updateField("shopInfo", "address", e.target.value)}
                  inputClassName="h-11"
                />
                <FormInput
                  label={t("chatbot.sections.shopInfo.fields.hotline")}
                  value={config.shopInfo?.hotline || ""}
                  onChange={(e) => updateField("shopInfo", "hotline", e.target.value)}
                  inputClassName="h-11"
                />
                <FormInput
                  label={t("chatbot.sections.shopInfo.fields.email")}
                  value={config.shopInfo?.email || ""}
                  onChange={(e) => updateField("shopInfo", "email", e.target.value)}
                  inputClassName="h-11"
                />
                <FormInput
                  label={t("chatbot.sections.shopInfo.fields.website")}
                  value={config.shopInfo?.website || ""}
                  onChange={(e) => updateField("shopInfo", "website", e.target.value)}
                  inputClassName="h-11"
                />
              </div>
            </SectionCard>

            <SectionCard
              title={`🧠 ${t("chatbot.sections.ai.title")}`}
              description={t("chatbot.sections.ai.description")}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <SearchableDropdown
                    label={t("chatbot.sections.ai.fields.provider")}
                    value={selectedProvider}
                    onChange={updateProvider}
                    items={providerDropdownItems}
                    disabled={saving || loadingModels || providerDropdownItems.length === 0}
                    allowClear={false}
                    required={false}
                    buttonClassName="h-11"
                    placeholder={t("chatbot.sections.ai.providerPlaceholder")}
                    searchPlaceholder={t(
                      "chatbot.sections.ai.providerSearchPlaceholder",
                    )}
                    emptyLabel={t("chatbot.sections.ai.providerEmptyLabel")}
                  />
                </div>
                <div>
                  <SearchableDropdown
                    label={t("chatbot.sections.ai.fields.model")}
                    value={config.ai?.model || ""}
                    onChange={updateModel}
                    items={modelDropdownItems}
                    onCreateNew={createModel}
                    disabled={saving || loadingModels}
                    allowClear={false}
                    required={false}
                    buttonClassName="h-11"
                    placeholder={t("chatbot.sections.ai.modelPlaceholder")}
                    searchPlaceholder={t(
                      "chatbot.sections.ai.modelSearchPlaceholder",
                    )}
                    createPlaceholder={t(
                      "chatbot.sections.ai.modelCreatePlaceholder",
                    )}
                    createAddLabel={t(
                      "chatbot.sections.ai.modelCreateAddLabel",
                    )}
                    emptyLabel={t("chatbot.sections.ai.modelEmptyLabel")}
                    duplicateCreateHint={t(
                      "chatbot.sections.ai.modelDuplicateCreateHint",
                    )}
                  />
                </div>
                <div>
                  <label className="block text-md font-medium mb-1.5">
                    {t("chatbot.sections.ai.fields.temperature", {
                      value: config.ai?.temperature ?? 0.7,
                    })}
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
                    className="w-full mt-2 accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-subtle mt-1">
                    <span>{t("chatbot.sections.ai.temperatureExact")}</span>
                    <span>{t("chatbot.sections.ai.temperatureCreative")}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted mt-1.5 mb-4">{modelCatalogHint}</p>

              <div>
                <FormTextarea
                  label={t("chatbot.sections.ai.fields.systemPrompt")}
                  value={config.ai?.systemRules || ""}
                  onChange={(e) =>
                    updateField("ai", "systemRules", e.target.value)
                  }
                  rows={8}
                  inputClassName="resize-y font-mono leading-relaxed"
                  placeholder={t("chatbot.sections.ai.systemPromptPlaceholder")}
                />
                <p className="text-sm text-muted mt-1.5">
                  {t("chatbot.sections.ai.systemPromptHint")}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <h3 className="text-md font-bold text-body mb-3">
                  {`⚙️ ${t("chatbot.sections.runtime.title")}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormInput
                      label={t("chatbot.sections.runtime.fields.maxProducts")}
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
                      inputClassName="h-11"
                    />
                    <p className="text-sm text-subtle mt-1">
                      {t("chatbot.sections.runtime.hints.maxProducts")}
                    </p>
                  </div>
                  <div>
                    <FormInput
                      label={t("chatbot.sections.runtime.fields.maxRetries")}
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
                      inputClassName="h-11"
                    />
                    <p className="text-sm text-subtle mt-1">
                      {t("chatbot.sections.runtime.hints.maxRetries")}
                    </p>
                  </div>
                  <div>
                    <FormInput
                      label={t("chatbot.sections.runtime.fields.planTimeoutMs")}
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
                      inputClassName="h-11"
                    />
                    <p className="text-sm text-subtle mt-1">
                      {t("chatbot.sections.runtime.hints.planTimeoutMs")}
                    </p>
                  </div>
                  <div>
                    <FormInput
                      label={t("chatbot.sections.runtime.fields.dbTimeoutMs")}
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
                      inputClassName="h-11"
                    />
                    <p className="text-sm text-subtle mt-1">
                      {t("chatbot.sections.runtime.hints.dbTimeoutMs")}
                    </p>
                  </div>
                  <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-md font-medium">
                        {t(
                          "chatbot.sections.runtime.fields.enableResponseSynthesis",
                        )}
                      </p>
                      <p className="text-sm text-subtle mt-1">
                        {t(
                          "chatbot.sections.runtime.hints.enableResponseSynthesis",
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "ai",
                          "enableResponseSynthesis",
                          !(config.ai?.enableResponseSynthesis === true),
                        )
                      }
                      className={`shrink-0 text-3xl transition-colors ${config.ai?.enableResponseSynthesis ? "text-blue-600" : "text-subtle"}`}
                      aria-label={t(
                        "chatbot.sections.runtime.fields.enableResponseSynthesis",
                      )}
                      title={t(
                        "chatbot.sections.runtime.fields.enableResponseSynthesis",
                      )}
                    >
                      {config.ai?.enableResponseSynthesis ? (
                        <FiToggleRight />
                      ) : (
                        <FiToggleLeft />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <SectionCard title={t("chatbot.sections.status.title")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mt-1">
                    {config.isEnabled
                      ? t("chatbot.sections.status.enabledDescription")
                      : t("chatbot.sections.status.disabledDescription")}
                  </p>
                </div>
                <button
                  onClick={() => updateTopLevel("isEnabled", !config.isEnabled)}
                  className={`text-3xl transition-colors ${config.isEnabled ? "text-green-500" : "text-subtle"}`}
                  title={
                    config.isEnabled
                      ? t("chatbot.actions.disable")
                      : t("chatbot.actions.enable")
                  }
                  aria-label={
                    config.isEnabled
                      ? t("chatbot.actions.disable")
                      : t("chatbot.actions.enable")
                  }
                >
                  {config.isEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title={`🎨 ${t("chatbot.sections.widget.title")}`}
              contentClassName="space-y-4"
            >
              <div>
                <FormInput
                  label={t("chatbot.sections.widget.fields.botName")}
                  value={config.bot?.name || ""}
                  onChange={(e) => updateField("bot", "name", e.target.value)}
                  inputClassName="h-11"
                />
              </div>

              <div>
                <FormInput
                  label={t("chatbot.sections.widget.fields.subtitle")}
                  value={config.bot?.subtitle || ""}
                  onChange={(e) =>
                    updateField("bot", "subtitle", e.target.value)
                  }
                  inputClassName="h-11"
                />
              </div>

              <div>
                <label className="block text-md font-medium mb-1.5">
                  {t("chatbot.sections.widget.fields.themeColor")}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.bot?.themeColor || "#2563eb"}
                    onChange={(e) =>
                      updateField("bot", "themeColor", e.target.value)
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.bot?.themeColor || "#2563eb"}
                    onChange={(e) =>
                      updateField("bot", "themeColor", e.target.value)
                    }
                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-md uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-md font-medium mb-1.5">
                  {t("chatbot.sections.widget.fields.avatar")}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0">
                    {config.bot?.avatarUrl ? (
                      <img
                        src={config.bot.avatarUrl}
                        alt={t("chatbot.sections.widget.avatarAlt")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiCpu className="text-2xl text-blue-500" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={config.bot?.avatarUrl || ""}
                    onChange={(e) =>
                      updateField("bot", "avatarUrl", e.target.value)
                    }
                    placeholder={t("chatbot.sections.widget.avatarPlaceholder")}
                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-md"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={`💬 ${t("chatbot.sections.welcome.title")}`}
              contentClassName="space-y-4"
            >
              <FormTextarea
                value={config.bot?.welcomeMessage || ""}
                onChange={(e) =>
                  updateField("bot", "welcomeMessage", e.target.value)
                }
                rows={5}
                inputClassName="resize-y"
                placeholder={t("chatbot.sections.welcome.placeholder")}
              />
              <p className="text-sm text-muted">
                {t("chatbot.sections.welcome.hint")}
              </p>
            </SectionCard>

            <SectionCard
              title={`⚡ ${t("chatbot.sections.suggestions.title")}`}
              description={t("chatbot.sections.suggestions.description")}
              contentClassName="space-y-3"
            >
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
                      className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-md"
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
                  placeholder={t("chatbot.sections.suggestions.newPlaceholder")}
                  className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-md"
                />
                <button
                  onClick={addSuggestion}
                  disabled={!newSuggestion.trim()}
                  className="h-10 px-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 text-md font-medium flex items-center justify-center gap-1 w-full sm:w-auto"
                >
                  <FiPlus />
                  {t("chatbot.actions.addSuggestion")}
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <ChatbotOverviewStatCard
              label={t("chatbot.overview.cards.status")}
              value={
                config.isEnabled ? (
                  <span className="flex items-center gap-2 text-green-500">
                    <FiCheckCircle />
                    {t("chatbot.overview.cards.active")}
                  </span>
                ) : (
                  <span className="text-red-500">
                    {t("chatbot.overview.cards.disabled")}
                  </span>
                )
              }
              icon={<FiMessageCircle />}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <ChatbotOverviewStatCard
              label={t("chatbot.overview.cards.model")}
              value={currentModel}
              description={t("chatbot.overview.cards.modelDescription", {
                value: config.ai?.temperature ?? notAvailable,
              })}
              icon={<FiCpu />}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <ChatbotOverviewStatCard
              label={t("chatbot.overview.cards.store")}
              value={storeName}
              description={t("chatbot.overview.cards.storeDescription", {
                value: hotline,
              })}
              icon={<FiCheckCircle />}
              iconClassName="bg-green-100 text-green-600"
            />
            <ChatbotOverviewStatCard
              label={t("chatbot.overview.cards.suggestions")}
              value={<span className="text-2xl font-bold">{suggestionsCount}</span>}
              description={t("chatbot.overview.cards.suggestionsDescription", {
                count: suggestionsCount,
              })}
              icon={<FiClock />}
              iconClassName="bg-orange-100 text-orange-600"
            />
          </div>

          <SectionCard title={`📋 ${t("chatbot.overview.configTitle")}`}>
            <pre className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm font-mono overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </SectionCard>
        </div>
      )}
      <ConfirmDialog
        open={showResetConfirm}
        title={t("chatbot.resetDialog.title")}
        message={t("chatbot.resetDialog.message")}
        confirmLabel={t("chatbot.resetDialog.confirm")}
        variant="warning"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
