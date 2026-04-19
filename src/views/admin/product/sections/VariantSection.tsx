import { memo, useEffect, useState } from "react";
import {
  FiClock,
  FiPlus,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import VariantBulkGeneratePanel from "./variant-section/VariantBulkGeneratePanel";
import VariantCard from "./variant-section/VariantCard";
import type { VariantSectionProps as Props } from "./types";

export default memo(function VariantSection(props: Props) {
  const { t } = useTranslation("adminCatalog");
  const {
    variants,
    variantSchema,
    uploadingVariantKeys,
    variantFileInputRefs,
    addVariant,
    generateVariantCombinations,
    sortVariantsByLatestUpdated,
    removeVariant,
    updateVariant,
    updateVariantSelection,
    regenerateVariantSku,
    getVariantUiKey,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
  } = props;

  const [showBulkGenerate, setShowBulkGenerate] = useState(false);
  const [bulkSelections, setBulkSelections] = useState<Record<string, string[]>>({});
  const [expandedVariants, setExpandedVariants] = useState<Record<string, boolean>>({});
  const [focusVariantKey, setFocusVariantKey] = useState<string | null>(null);
  const bulkActionButtonClass =
    "h-9 px-3 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 text-body-soft";

  useEffect(() => {
    setBulkSelections((prev) =>
      Object.fromEntries(
        variantSchema.map((attribute) => {
          const activeOptionIds = attribute.options
            .filter((option) => option.active !== false)
            .map((option) => option.id);
          const hadPreviousSelection = Object.prototype.hasOwnProperty.call(
            prev,
            attribute.id,
          );

          if (!hadPreviousSelection) {
            return [attribute.id, activeOptionIds];
          }

          const preservedSelection = (prev[attribute.id] || []).filter((id) =>
            activeOptionIds.includes(id),
          );
          return [attribute.id, preservedSelection];
        }),
      ),
    );
  }, [variantSchema]);

  useEffect(() => {
    setExpandedVariants((prev) => {
      const next = Object.fromEntries(
        variants.map((variant, index) => {
          const variantUiKey = getVariantUiKey(variant, index);
          return [variantUiKey, prev[variantUiKey] ?? false];
        }),
      );
      const nextKeys = Object.keys(next);
      const prevKeys = Object.keys(prev);

      if (
        nextKeys.length === prevKeys.length
        && nextKeys.every((key) => prev[key] === next[key])
      ) {
        return prev;
      }

      return next;
    });
  }, [getVariantUiKey, variants]);

  const toggleBulkOption = (attributeId: string, optionId: string) => {
    setBulkSelections((prev) => {
      const current = new Set(prev[attributeId] || []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        current.add(optionId);
      }
      return { ...prev, [attributeId]: Array.from(current) };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">{t("variantSection.title")}</h2>
          <span className="text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full">
            {t("variantSection.count", { count: variants.length })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {variantSchema.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBulkGenerate((prev) => !prev)}
              className="text-md font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              title={t("variantSection.generateTitle")}
            >
              {t("variantSection.generate")}
            </button>
          )}
          <button
            type="button"
            onClick={sortVariantsByLatestUpdated}
            className="text-md font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            title={t("variantSection.sortLatestUpdatedTitle")}
          >
            <FiClock />
            {t("variantSection.sortLatestUpdated")}
          </button>
          <button
            onClick={() => {
              const nextVariantKey = addVariant();
              if (!nextVariantKey) return;
              setExpandedVariants((prev) => ({
                ...prev,
                [nextVariantKey]: true,
              }));
              setFocusVariantKey(nextVariantKey);
            }}
            className="text-md font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
          >
            <FiPlus /> {t("variantSection.add")}
          </button>
        </div>
      </div>

      {showBulkGenerate && variantSchema.length > 0 && (
        <VariantBulkGeneratePanel
          variantSchema={variantSchema}
          bulkSelections={bulkSelections}
          toggleBulkOption={toggleBulkOption}
          clearAllSelections={() =>
            setBulkSelections(
              Object.fromEntries(
                variantSchema.map((attribute) => [attribute.id, [] as string[]]),
              ),
            )
          }
          selectAllSelections={() =>
            setBulkSelections(
              Object.fromEntries(
                variantSchema.map((attribute) => [
                  attribute.id,
                  attribute.options
                    .filter((option) => option.active !== false)
                    .map((option) => option.id),
                ]),
              ),
            )
          }
          generateSelections={() => generateVariantCombinations(bulkSelections)}
          actionButtonClass={bulkActionButtonClass}
        />
      )}

      <div className="space-y-4">
        {variants.map((variant, index) => {
          const variantUiKey = getVariantUiKey(variant, index);
          const variantOrder = index + 1;
          const isVariantUploading = Boolean(uploadingVariantKeys[variantUiKey]);
          const isExpanded = expandedVariants[variantUiKey] ?? false;

          return (
            <VariantCard
              key={variantUiKey}
              variant={variant}
              index={index}
              variantUiKey={variantUiKey}
              variantOrder={variantOrder}
              variantSchema={variantSchema}
              isExpanded={isExpanded}
              isVariantUploading={isVariantUploading}
              canRemove={variants.length > 1}
              autoFocusSku={focusVariantKey === variantUiKey}
              variantFileInputRefs={variantFileInputRefs}
              onAutoFocusHandled={() => {
                setFocusVariantKey((currentKey) =>
                  currentKey === variantUiKey ? null : currentKey,
                );
              }}
              onToggleExpanded={() =>
                setExpandedVariants((prev) => ({
                  ...prev,
                  [variantUiKey]: !(prev[variantUiKey] ?? false),
                }))
              }
              removeVariant={removeVariant}
              updateVariant={updateVariant}
              updateVariantSelection={updateVariantSelection}
              regenerateVariantSku={regenerateVariantSku}
              handleVariantFilesSelected={handleVariantFilesSelected}
              removeVariantPendingFile={removeVariantPendingFile}
              deleteVariantImage={deleteVariantImage}
            />
          );
        })}

        {variants.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl mt-2">
            <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
              <FiPlus className="text-2xl text-purple-500" />
            </div>
            <p className="text-muted text-md font-medium">
              {t("variantSection.emptyTitle")}
            </p>
            <p className="text-subtle text-sm mt-1">
              {t("variantSection.emptyDescription")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
