import type {
  VariantAttributeSchemaResponse,
  VariantFormData,
} from "@/types";
import type { VariantSectionProps } from "../types";

export interface VariantBulkGeneratePanelProps {
  variantSchema: VariantAttributeSchemaResponse[];
  bulkSelections: Record<string, string[]>;
  toggleBulkOption: (attributeId: string, optionId: string) => void;
  clearAllSelections: () => void;
  selectAllSelections: () => void;
  generateSelections: () => void;
  actionButtonClass: string;
}

export interface VariantCardProps {
  variant: VariantFormData;
  index: number;
  variantUiKey: string;
  variantOrder: number;
  variantSchema: VariantAttributeSchemaResponse[];
  isExpanded: boolean;
  isVariantUploading: boolean;
  canRemove: boolean;
  autoFocusSku?: boolean;
  variantFileInputRefs: VariantSectionProps["variantFileInputRefs"];
  onAutoFocusHandled?: () => void;
  onToggleExpanded: () => void;
  removeVariant: VariantSectionProps["removeVariant"];
  updateVariant: VariantSectionProps["updateVariant"];
  updateVariantSelection: VariantSectionProps["updateVariantSelection"];
  regenerateVariantSku: VariantSectionProps["regenerateVariantSku"];
  handleVariantFilesSelected: VariantSectionProps["handleVariantFilesSelected"];
  removeVariantPendingFile: VariantSectionProps["removeVariantPendingFile"];
  deleteVariantImage: VariantSectionProps["deleteVariantImage"];
}
