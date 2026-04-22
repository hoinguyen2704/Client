import {
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { ExpandToggle, SearchableDropdown } from "@/components";
import type { BasicInfoSectionProps } from "./types";
import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SPEC_COLLAPSE_THRESHOLD = 6;

type Props = BasicInfoSectionProps & {
  showBasicInfo?: boolean;
  showSpecs?: boolean;
};

export default memo(function BasicInfoSection(props: Props) {
  const { t } = useTranslation("adminCatalog");
  const {
    name, setName,
    description, setDescription,
    categoryId, setCategoryId,
    brandId, setBrandId,
    productCode, setProductCode,
    isEditMode,
    specs, setSpecs,
    categories,
    brands,
    showTemplatePopup, setShowTemplatePopup,
    templatePopupRef,
    savingCategory,
    savingBrand,
    getTemplateKeys,
    getHintForSpec,
    getSpecAttributeIdByKey,
    handleCreateCategory,
    handleCreateBrand,
    categoryLocked,
    showBasicInfo = true,
    showSpecs = true,
  } = props;

  const [showAllSpecs, setShowAllSpecs] = useState(false);
  useEffect(() => {
    if (specs.length <= SPEC_COLLAPSE_THRESHOLD && showAllSpecs) {
      setShowAllSpecs(false);
    }
  }, [specs.length, showAllSpecs]);

  const visibleSpecs = useMemo(
    () =>
      (showAllSpecs ? specs : specs.slice(0, SPEC_COLLAPSE_THRESHOLD)).map(
        (spec, index) => ({ spec, index }),
      ),
    [specs, showAllSpecs],
  );

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      {showBasicInfo && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold mb-4">{t("basicInfo.title")}</h2>

        <div>
          <label className="block font-medium mb-2">{t("basicInfo.name")} *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("basicInfo.placeholders.name")}
            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">{t("basicInfo.productCode.label")} (productCode)</label>
          <input
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder={t("basicInfo.placeholders.productCode")}
            readOnly={isEditMode}
            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900"
          />
          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? t("basicInfo.productCode.locked")
              : t("basicInfo.productCode.hint")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <SearchableDropdown
            label={t("basicInfo.category")}
            value={categoryId}
            onChange={setCategoryId}
            items={categories}
            placeholder={t("basicInfo.selectCategory")}
            searchPlaceholder={t("basicInfo.placeholders.categorySearch")}
            disabled={categoryLocked}
            lockedMessage={t("basicInfo.categoryLocked")}
            onCreateNew={handleCreateCategory}
            isCreatingProcess={savingCategory}
            createPlaceholder={t("basicInfo.placeholders.newCategory")}
            createAddLabel={t("basicInfo.addCategory")}
            emptyLabel={t("basicInfo.emptyResults")}
            duplicateCreateHint={t("basicInfo.duplicateCreateHint")}
          />
          {/* Brand Dropdown */}
          <SearchableDropdown
            label={t("basicInfo.brand")}
            value={brandId}
            onChange={setBrandId}
            items={brands}
            placeholder={t("basicInfo.selectBrand")}
            searchPlaceholder={t("basicInfo.placeholders.brandSearch")}
            onCreateNew={handleCreateBrand}
            isCreatingProcess={savingBrand}
            createPlaceholder={t("basicInfo.placeholders.newBrand")}
            createAddLabel={t("basicInfo.addBrand")}
            emptyLabel={t("basicInfo.emptyResults")}
            duplicateCreateHint={t("basicInfo.duplicateCreateHint")}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">{t("basicInfo.description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("basicInfo.placeholders.description")}
            className="w-full h-64 resize-y rounded-xl border border-slate-200 bg-white p-4 outline-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        </div>
      )}

      {/* Specs Builder */}
      {showSpecs && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t("basicInfo.specs.title")}</h2>
          <div className="relative" ref={templatePopupRef}>
            <button
              onClick={() => setShowTemplatePopup(!showTemplatePopup)}
              className="text-md font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              title={t("basicInfo.specs.templateTitle")}
            >
              {t("basicInfo.specs.templateAction")}
            </button>
            {showTemplatePopup && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">
                  {t("basicInfo.specs.templateModalTitle")}
                </p>
                {!categoryId ? (
                  <p className="text-md text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    {t("basicInfo.specs.templateRequiresCategory")}
                  </p>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {getTemplateKeys().map((templateKey) => {
                        const alreadyAdded = specs.some(
                          (s) => s.key === templateKey,
                        );
                        return (
                          <button
                            key={templateKey}
                            onClick={() => {
                              if (alreadyAdded) {
                                setSpecs(
                                  specs.filter(
                                    (s) => s.key !== templateKey,
                                  ),
                                );
                              } else {
                                setSpecs([
                                  ...specs,
                                  {
                                    specAttributeId:
                                      getSpecAttributeIdByKey(templateKey),
                                    key: templateKey,
                                    value: "",
                                  },
                                ]);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
                              alreadyAdded
                                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium"
                                : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {alreadyAdded ? (
                              <FiCheckSquare className="text-blue-500 flex-shrink-0" />
                            ) : (
                              <FiSquare className="text-slate-400 flex-shrink-0" />
                            )}
                            {templateKey}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <button
                          onClick={() => {
                            const newSpecs = [...specs];
                            getTemplateKeys().forEach((k) => {
                              if (!newSpecs.some((s) => s.key === k))
                                newSpecs.push({
                                  specAttributeId: getSpecAttributeIdByKey(k),
                                  key: k,
                                  value: "",
                                });
                            });
                            setSpecs(newSpecs);
                          }}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {t("basicInfo.specs.selectAll")}
                        </button>
                        <button
                          onClick={() => setShowTemplatePopup(false)}
                          className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          {t("basicInfo.specs.close")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {visibleSpecs.map(({ spec, index }) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={spec.key}
                readOnly
                className="flex-1 h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-none outline-none text-md text-slate-600 dark:text-slate-300"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => {
                  const newSpecs = [...specs];
                  newSpecs[index].value = e.target.value;
                  setSpecs(newSpecs);
                }}
                placeholder={getHintForSpec(spec.key)}
                className="flex-1 h-10 rounded-lg border border-slate-200 bg-white px-3 text-md outline-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          ))}

          {specs.length === 0 && (
            <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-md">{t("basicInfo.specs.empty")}</p>
            </div>
          )}
        </div>

        {specs.length > SPEC_COLLAPSE_THRESHOLD && (
          <ExpandToggle
            expanded={showAllSpecs}
            onToggle={() => setShowAllSpecs((prev) => !prev)}
            expandLabel={t("basicInfo.specs.expand")}
            collapseLabel={t("basicInfo.specs.collapse")}
            className="mt-1"
          />
        )}

        </div>
      )}
    </div>
  );
});
