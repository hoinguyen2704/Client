import { memo, useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiLoader,
  FiPlus,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Button, FormInput, Modal } from "@/components";
import VariantBulkGeneratePanel from "./variant-section/VariantBulkGeneratePanel";
import VariantCard from "./variant-section/VariantCard";
import type { VariantSectionProps as Props } from "./types";

export default memo(function VariantSection(props: Props) {
  const { t } = useTranslation("adminCatalog");
  const {
    variants,
    variantSchema,
    uploadingVariantKeys,
    creatingOptionByFieldKey,
    creatingAttribute,
    variantFileInputRefs,
    addVariant,
    generateVariantCombinations,
    sortVariantsByLatestUpdated,
    removeVariant,
    updateVariant,
    isVariantDirty,
    resetVariant,
    updateVariantSelection,
    createVariantAttribute,
    createVariantAttributeOption,
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
  const [showCreateAttributeModal, setShowCreateAttributeModal] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeOptionLabelsText, setNewAttributeOptionLabelsText] = useState("");
  const hasAtLeastOneOptionLabel = useMemo(
    () =>
      newAttributeOptionLabelsText
        .split(/[,，]/)
        .some((label) => label.trim().length > 0),
    [newAttributeOptionLabelsText],
  );
  const bulkActionButtonClass =
    "h-9 px-3 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 text-body-soft";
  const canCreateAttribute = useMemo(
    () =>
      newAttributeName.trim().length > 0
      && hasAtLeastOneOptionLabel
      && !creatingAttribute,
    [creatingAttribute, hasAtLeastOneOptionLabel, newAttributeName],
  );

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

  const closeCreateAttributeModal = () => {
    if (creatingAttribute) return;
    setShowCreateAttributeModal(false);
    setNewAttributeName("");
    setNewAttributeOptionLabelsText("");
  };

  const handleCreateAttribute = async () => {
    if (!canCreateAttribute) return;
    try {
      await createVariantAttribute(
        newAttributeName.trim(),
        newAttributeOptionLabelsText.trim(),
      );
      closeCreateAttributeModal();
    } catch {
      // Toast is handled by the form hook; keep modal open for retry.
    }
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
              isDirty={isVariantDirty(variant, index)}
              resetVariant={resetVariant}
              updateVariantSelection={updateVariantSelection}
              onOpenCreateAttributeModal={() => setShowCreateAttributeModal(true)}
              createVariantAttributeOption={createVariantAttributeOption}
              creatingOptionByFieldKey={creatingOptionByFieldKey}
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

      <Modal
        open={showCreateAttributeModal}
        onClose={closeCreateAttributeModal}
        title={t("variantSection.addAttributeTitle")}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-md text-slate-500 dark:text-slate-400">
            {t("variantSection.addAttributeDescription")}
          </p>

          <FormInput
            label={t("variantSection.attributeNameLabel")}
            value={newAttributeName}
            onChange={(event) => setNewAttributeName(event.target.value)}
            placeholder={t("variantSection.attributeNamePlaceholder")}
            disabled={creatingAttribute}
            autoFocus
          />

          <FormInput
            label={t("variantSection.attributeFirstValueLabel")}
            value={newAttributeOptionLabelsText}
            onChange={(event) => setNewAttributeOptionLabelsText(event.target.value)}
            placeholder={t("variantSection.attributeFirstValuePlaceholder")}
            disabled={creatingAttribute}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
            <Button
              onClick={closeCreateAttributeModal}
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={creatingAttribute}
            >
              {t("common:modal.cancel")}
            </Button>
            <Button
              onClick={() => {
                void handleCreateAttribute();
              }}
              icon={creatingAttribute ? <FiLoader className="animate-spin" /> : <FiPlus />}
              className="w-full sm:w-auto"
              disabled={!canCreateAttribute}
            >
              {creatingAttribute
                ? t("variantSection.creatingAttribute")
                : t("variantSection.addAttributeSubmit")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});
