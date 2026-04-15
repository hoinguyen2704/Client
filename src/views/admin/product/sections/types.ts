import type { UseProductFormReturn } from "../hooks/useProductForm";

/** Props for BasicInfoSection — product name, category/brand dropdowns, description, specs builder */
export type BasicInfoSectionProps = Pick<
  UseProductFormReturn,
  | "name" | "setName"
  | "description" | "setDescription"
  | "categoryId" | "setCategoryId"
  | "brandId" | "setBrandId"
  | "productCode" | "setProductCode"
  | "isEditMode"
  | "specs" | "setSpecs"
  | "categories" | "setCategories"
  | "brands"
  | "showCategoryDropdown" | "setShowCategoryDropdown"
  | "showBrandDropdown" | "setShowBrandDropdown"
  | "categorySearch" | "setCategorySearch"
  | "brandSearch" | "setBrandSearch"
  | "categoryDropdownRef"
  | "brandDropdownRef"
  | "showTemplatePopup" | "setShowTemplatePopup"
  | "templatePopupRef"
  | "isCreatingCategory" | "setIsCreatingCategory"
  | "newCategoryName" | "setNewCategoryName"
  | "savingCategory"
  | "isCreatingBrand" | "setIsCreatingBrand"
  | "newBrandName" | "setNewBrandName"
  | "savingBrand"
  | "getTemplateKeys"
  | "getHintForSpec"
  | "getSpecAttributeIdByKey"
  | "handleCreateCategory"
  | "handleCreateBrand"
>;

/** Props for VariantSection — variant cards with SKU, price, stock, images */
export type VariantSectionProps = Pick<
  UseProductFormReturn,
  | "variants"
  | "variantSchema"
  | "uploadingVariantKeys"
  | "variantFileInputRefs"
  | "addVariant"
  | "generateVariantCombinations"
  | "removeVariant"
  | "updateVariant"
  | "updateVariantSelection"
  | "regenerateVariantSku"
  | "getVariantUiKey"
  | "handleVariantFilesSelected"
  | "removeVariantPendingFile"
  | "deleteVariantImage"
>;

/** Props for ImageUploadSection — drag-drop area, pending/existing images */
export type ImageUploadSectionProps = Pick<
  UseProductFormReturn,
  | "isEditMode"
  | "existingImages"
  | "pendingFiles"
  | "uploadingImages"
  | "isDragging" | "setIsDragging"
  | "fileInputRef"
  | "handleImageFiles"
  | "removePendingFile"
  | "deleteExistingImage"
>;

/** Props for StatusPricingSection — status dropdown, origin price, featured toggle */
export type StatusPricingSectionProps = Pick<
  UseProductFormReturn,
  | "status" | "setStatus"
  | "originPrice" | "setOriginPrice"
  | "isFeatured" | "setIsFeatured"
  | "showStatusDropdown" | "setShowStatusDropdown"
  | "statusDropdownRef"
>;
