import { FiLoader, FiSave } from "react-icons/fi";
import { BackButton, Button, ConfirmDialog, PrimaryButton } from "@/components";
import { useTranslation } from "react-i18next";
import VariantSection from "./sections/VariantSection";
import useProductVariantsForm from "./hooks/useProductVariantsForm";

export default function ProductVariantsPage() {
  const { t } = useTranslation(["adminCatalog", "common"]);
  const form = useProductVariantsForm();

  if (form.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">
            {t("variantPage.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <BackButton
            to={`/admin/products/${form.id}`}
            label={t("variantPage.backToProduct")}
            className="text-xl font-bold"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {t("variantPage.title")}
            </h1>
            <p className="text-sm text-slate-500">
              {form.productName
                ? `${form.productName}${form.categoryName ? ` • ${form.categoryName}` : ""}`
                : t("variantPage.fallbackDescription")}
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
          <Button
            href={`/admin/products/${form.id}`}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
          >
            {t("variantPage.productInfo")}
          </Button>
          <PrimaryButton
            onClick={form.handleSubmit}
            disabled={form.saving}
            icon={form.saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            className="flex-1 sm:flex-none"
          >
            {t("variantPage.save")}
          </PrimaryButton>
        </div>
      </div>

      {form.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-md text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {form.error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {t("variantPage.schemaHint")}
      </div>

      <VariantSection
        variants={form.variants}
        variantSchema={form.variantSchema}
        uploadingVariantKeys={form.uploadingVariantKeys}
        creatingOptionByFieldKey={form.creatingOptionByFieldKey}
        variantFileInputRefs={form.variantFileInputRefs}
        addVariant={form.addVariant}
        generateVariantCombinations={form.generateVariantCombinations}
        sortVariantsByLatestUpdated={form.sortVariantsByLatestUpdated}
        removeVariant={form.removeVariant}
        updateVariant={form.updateVariant}
        updateVariantSelection={form.updateVariantSelection}
        createVariantAttributeOption={form.createVariantAttributeOption}
        regenerateVariantSku={form.regenerateVariantSku}
        getVariantUiKey={form.getVariantUiKey}
        handleVariantFilesSelected={form.handleVariantFilesSelected}
        removeVariantPendingFile={form.removeVariantPendingFile}
        deleteVariantImage={form.deleteVariantImage}
      />

      <ConfirmDialog
        open={form.skuChangeConfirmOpen}
        title={t("variantPage.skuChange.title")}
        message={form.skuChangeConfirmMessage}
        confirmLabel={t("variantPage.skuChange.confirmLabel")}
        cancelLabel={t("common:actions.cancel")}
        variant="warning"
        onConfirm={form.confirmSkuChanges}
        onCancel={form.cancelSkuChanges}
      />
    </div>
  );
}
