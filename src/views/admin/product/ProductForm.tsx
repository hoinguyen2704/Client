import { FiLoader, FiSave } from "react-icons/fi";
import { Button, PrimaryButton, BackButton } from "@/components";
import useProductForm from "./hooks/useProductForm";
import BasicInfoSection from "./sections/BasicInfoSection";
import VariantSection from "./sections/VariantSection";
import ImageUploadSection from "./sections/ImageUploadSection";
import StatusPricingSection from "./sections/StatusPricingSection";

export default function ProductForm() {
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
  };

  // Loading state
  if (form.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">
            Đang tải sản phẩm...
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
            {form.isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
          <Button
            onClick={() => form.navigate("/admin/products")}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
          >
            Hủy
          </Button>
          <PrimaryButton
            onClick={form.handleSubmit}
            disabled={form.saving}
            icon={form.saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            className="flex-1 sm:flex-none"
          >
            {form.isEditMode ? "Cập nhật" : "Lưu sản phẩm"}
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
          <BasicInfoSection {...basicInfoSectionProps} showSpecs={false} />

          <VariantSection
            variants={form.variants}
            variantSchema={form.variantSchema}
            uploadingVariantKeys={form.uploadingVariantKeys}
            variantFileInputRefs={form.variantFileInputRefs}
            addVariant={form.addVariant}
            generateVariantCombinations={form.generateVariantCombinations}
            removeVariant={form.removeVariant}
            updateVariant={form.updateVariant}
            updateVariantSelection={form.updateVariantSelection}
            regenerateVariantSku={form.regenerateVariantSku}
            getVariantUiKey={form.getVariantUiKey}
            handleVariantFilesSelected={form.handleVariantFilesSelected}
            removeVariantPendingFile={form.removeVariantPendingFile}
            deleteVariantImage={form.deleteVariantImage}
          />

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
