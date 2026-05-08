import { FiChevronDown, FiCheck, FiStar } from "react-icons/fi";
import type { StatusPricingSectionProps as Props } from "./types";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { parseOptionalIntegerInputValue } from "@/utils/numericInput";

export default memo(function StatusPricingSection(props: Props) {
  const { t } = useTranslation("adminCatalog");
  const {
    isEditMode,
    status, setStatus,
    originPrice, setOriginPrice,
    isFeatured, setIsFeatured,
    showStatusDropdown, setShowStatusDropdown,
    statusDropdownRef,
  } = props;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <h2 className="text-lg font-bold mb-4">{t("statusPricing.title")}</h2>

      <div>
        <label className="block font-medium mb-2">{t("statusPricing.status")}</label>
        <div className="relative" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => {
              if (!isEditMode) return;
              setShowStatusDropdown(!showStatusDropdown);
            }}
            disabled={!isEditMode}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status === "ACTIVE"
                    ? "bg-emerald-500"
                    : status === "DRAFT"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />
              <span className="text-ink">
                {status === "ACTIVE"
                  ? t("statusPricing.statusOptions.active")
                  : status === "DRAFT"
                    ? t("statusPricing.statusOptions.draft")
                    : t("statusPricing.statusOptions.inactive")}
              </span>
            </div>
            <FiChevronDown
              className={`text-subtle transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showStatusDropdown && (
            <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden p-1">
              {[
                {
                  value: "ACTIVE",
                  label: t("statusPricing.statusOptions.active"),
                  color: "bg-emerald-500",
                },
                {
                  value: "DRAFT",
                  label: t("statusPricing.statusOptions.draft"),
                  color: "bg-amber-500",
                },
                {
                  value: "INACTIVE",
                  label: t("statusPricing.statusOptions.inactive"),
                  color: "bg-slate-400",
                },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    setStatus(opt.value);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-md transition-colors text-left ${
                    status === opt.value
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700 text-body"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${opt.color} flex-shrink-0`}
                  />
                  <span className="flex-1">{opt.label}</span>
                  {status === opt.value && (
                    <FiCheck className="text-blue-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {!isEditMode && (
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            {t("statusPricing.draftHint")}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-2">{t("statusPricing.originPrice")}</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={originPrice}
          onChange={(e) =>
            setOriginPrice(parseOptionalIntegerInputValue(e.target.value))
          }
          placeholder="0"
          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
        />
        <p className="text-sm text-subtle mt-1">
          {t("statusPricing.originPriceHint")}
        </p>
      </div>

      {/* Featured toggle */}
      <div>
        <label className="block font-medium mb-2">{t("statusPricing.featured")}</label>
        <button
          type="button"
          onClick={() => setIsFeatured(!isFeatured)}
          className={`w-full h-12 px-4 rounded-xl flex items-center justify-between transition-colors ${
            isFeatured
              ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-300 dark:border-amber-700"
              : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiStar
              className={
                isFeatured
                  ? "text-amber-500 fill-amber-500"
                  : "text-subtle"
              }
            />
            <span
              className={
                isFeatured
                  ? "text-amber-700 dark:text-amber-300 font-medium"
                  : "text-muted"
              }
            >
              {isFeatured
                ? t("statusPricing.featuredOn")
                : t("statusPricing.featuredOff")}
            </span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors relative ${
              isFeatured
                ? "bg-amber-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                isFeatured ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
});
