import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components";
import type { VariantBulkGeneratePanelProps } from "./types";

export default memo(function VariantBulkGeneratePanel(
  props: VariantBulkGeneratePanelProps,
) {
  const { t } = useTranslation("adminCatalog");
  const {
    variantSchema,
    bulkSelections,
    toggleBulkOption,
    clearAllSelections,
    selectAllSelections,
    generateSelections,
    actionButtonClass,
  } = props;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-800/30">
      <p className="text-sm font-semibold text-body-soft">
        {t("variantBulkGenerate.description")}
      </p>

      <div className="space-y-3">
        {variantSchema.map((attribute) => (
          <div key={`bulk-${attribute.id}`}>
            <p className="mb-1.5 text-sm font-medium">{attribute.name}</p>
            <div className="flex flex-wrap gap-2">
              {attribute.options
                .filter((option) => option.active !== false)
                .map((option) => {
                  const checked = (bulkSelections[attribute.id] || []).includes(option.id);

                  return (
                    <label
                      key={`bulk-${attribute.id}-${option.id}`}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        checked
                          ? "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                          : "border-slate-200 text-body-soft dark:border-slate-700"
                      }`}
                    >
                      <span className="mr-1.5 align-middle">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleBulkOption(attribute.id, option.id)}
                          className="h-4 w-4 rounded"
                        />
                      </span>
                      {option.label}
                    </label>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={clearAllSelections}
          className={actionButtonClass}
        >
          {t("variantBulkGenerate.clearAll")}
        </button>
        <button
          type="button"
          onClick={selectAllSelections}
          className={actionButtonClass}
        >
          {t("variantBulkGenerate.selectAll")}
        </button>
        <button
          type="button"
          onClick={generateSelections}
          className="h-9 rounded-lg bg-purple-600 px-3 text-sm font-semibold text-white hover:bg-purple-700"
        >
          {t("variantBulkGenerate.generate")}
        </button>
      </div>
    </div>
  );
});
