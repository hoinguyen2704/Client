import type { VariantFormData } from "@/types";

export interface VariantResetBaseline {
  sku: string;
  skuMode: VariantFormData["skuMode"];
  selections: Record<string, string>;
  price: VariantFormData["price"];
  compareAtPrice: VariantFormData["compareAtPrice"];
  stock: VariantFormData["stock"];
  active: boolean;
}

export interface CategorySpecTemplate {
  id: string;
  specKey: string;
  hint?: string;
  sortOrder?: number;
}
