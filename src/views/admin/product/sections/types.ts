import type {
  VariantAttributeSchemaResponse,
  VariantFormData,
} from "@/types";
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
  | "categoryLocked"
>;

/** Props for VariantSection — variant cards with SKU, price, stock, images */
export interface VariantSectionProps {
  variants: VariantFormData[];
  variantSchema: VariantAttributeSchemaResponse[];
  uploadingVariantKeys: Record<string, boolean>;
  variantFileInputRefs: { current: Record<string, HTMLInputElement | null> };
  addVariant: () => void;
  generateVariantCombinations: (
    selectedOptionsByAttribute: Record<string, string[]>,
  ) => void;
  sortVariantsByBestSelling: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (
    index: number,
    field: keyof VariantFormData,
    value: string | boolean,
  ) => void;
  updateVariantSelection: (
    index: number,
    attributeId: string,
    optionId: string,
  ) => void;
  regenerateVariantSku: (index: number) => void;
  getVariantUiKey: (variant: VariantFormData, index: number) => string;
  handleVariantFilesSelected: (index: number, files: File[]) => Promise<void>;
  removeVariantPendingFile: (variantIndex: number, fileIndex: number) => void;
  deleteVariantImage: (variantIndex: number, imageId: string) => Promise<void>;
}

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
  | "isEditMode"
  | "status" | "setStatus"
  | "originPrice" | "setOriginPrice"
  | "isFeatured" | "setIsFeatured"
  | "showStatusDropdown" | "setShowStatusDropdown"
  | "statusDropdownRef"
>;
