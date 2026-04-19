import { FiLoader, FiSave } from "react-icons/fi";
import { Button, PrimaryButton, BackButton } from "@/components";
import { useTranslation } from "react-i18next";
import useProductForm from "./hooks/useProductForm";
import BasicInfoSection from "./sections/BasicInfoSection";
import ImageUploadSection from "./sections/ImageUploadSection";
import StatusPricingSection from "./sections/StatusPricingSection";

export default function ProductForm() {
  const { t } = useTranslation("adminCatalog");
  const form = useProductForm();
  const basicInfoSectionProps = {
    name: form.name, setName: form.setName,
    description: form.description, setDescription: form.setDescription,
    categoryId: form.categoryId, setCategoryId: form.setCategoryId,
    brandId: form.brandId, setBrandId: form.setBrandId,
    productCode: form.productCode, setProductCode: form.setProductCode,
    isEditMode: form.isEditMode,
    specs: form.specs, setSpecs: form.setSpecs,
    categories: form.categories, setCategories: form.setCategories,
    brands: form.brands,
    showCategoryDropdown: form.showCategoryDropdown, setShowCategoryDropdown: form.setShowCategoryDropdown,
    showBrandDropdown: form.showBrandDropdown, setShowBrandDropdown: form.setShowBrandDropdown,
    categorySearch: form.categorySearch, setCategorySearch: form.setCategorySearch,
    brandSearch: form.brandSearch, setBrandSearch: form.setBrandSearch,
    categoryDropdownRef: form.categoryDropdownRef,
    brandDropdownRef: form.brandDropdownRef,
    showTemplatePopup: form.showTemplatePopup, setShowTemplatePopup: form.setShowTemplatePopup,
    templatePopupRef: form.templatePopupRef,
    isCreatingCategory: form.isCreatingCategory, setIsCreatingCategory: form.setIsCreatingCategory,
    newCategoryName: form.newCategoryName, setNewCategoryName: form.setNewCategoryName,
    savingCategory: form.savingCategory,
    isCreatingBrand: form.isCreatingBrand, setIsCreatingBrand: form.setIsCreatingBrand,
    newBrandName: form.newBrandName, setNewBrandName: form.setNewBrandName,
    savingBrand: form.savingBrand,
    getTemplateKeys: form.getTemplateKeys,
    getHintForSpec: form.getHintForSpec,
    getSpecAttributeIdByKey: form.getSpecAttributeIdByKey,
    handleCreateCategory: form.handleCreateCategory,
    handleCreateBrand: form.handleCreateBrand,
    categoryLocked: form.categoryLocked,
  };

  // Loading state
  if (form.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">
            {t("productForm.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackButton to="/admin/products" />
          <h1 className="text-xl sm:text-2xl font-bold">
            {form.isEditMode
              ? t("productForm.editTitle")
              : t("productForm.createTitle")}
          </h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
          {form.isEditMode && (
            <Button
              href={`/admin/products/${form.id}/variants`}
              variant="secondary"
              size="md"
              className="flex-1 sm:flex-none"
            >
              {t("productForm.manageVariants")}
            </Button>
          )}
          <Button
            onClick={() => form.navigate("/admin/products")}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
          >
            {t("productForm.cancel")}
          </Button>
          <PrimaryButton
            onClick={form.handleSubmit}
            disabled={form.saving}
            icon={form.saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            className="flex-1 sm:flex-none"
          >
            {form.isEditMode ? t("productForm.update") : t("productForm.save")}
          </PrimaryButton>
        </div>
      </div>

      {/* Error message */}
      {form.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-md">
          {form.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {form.isEditMode && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {form.hasVariants
                      ? t("productForm.variantNoticeWithCount", {
                          count: form.variantCount,
                        })
                      : t("productForm.variantNoticeEmpty")}
                  </p>
                  <p className="text-sm">
                    {t("productForm.variantNoticeDescription")}
                  </p>
                </div>
                <Button
                  href={`/admin/products/${form.id}/variants`}
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  {t("productForm.manageVariants")}
                </Button>
              </div>
            </div>
          )}

          <BasicInfoSection {...basicInfoSectionProps} showSpecs={false} />

          <BasicInfoSection {...basicInfoSectionProps} showBasicInfo={false} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ImageUploadSection
            isEditMode={form.isEditMode}
            existingImages={form.existingImages}
            pendingFiles={form.pendingFiles}
            uploadingImages={form.uploadingImages}
            isDragging={form.isDragging} setIsDragging={form.setIsDragging}
            fileInputRef={form.fileInputRef}
            handleImageFiles={form.handleImageFiles}
            removePendingFile={form.removePendingFile}
            deleteExistingImage={form.deleteExistingImage}
          />

          <StatusPricingSection
            isEditMode={form.isEditMode}
            status={form.status} setStatus={form.setStatus}
            originPrice={form.originPrice} setOriginPrice={form.setOriginPrice}
            isFeatured={form.isFeatured} setIsFeatured={form.setIsFeatured}
            showStatusDropdown={form.showStatusDropdown} setShowStatusDropdown={form.setShowStatusDropdown}
            statusDropdownRef={form.statusDropdownRef}
          />
        </div>
      </div>
    </div>
  );
}
