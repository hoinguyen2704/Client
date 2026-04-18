// Product
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mainImageUrl?: string;
  brandId?: string;
  brandName?: string;
  category?: CategoryResponse;
  productCode?: string;
  originPrice: number;
  lowestPrice?: number;
  averageRating?: number;
  totalReviews?: number;
  status: string;
  isFeatured?: boolean;
  specSchema?: ProductSpecSchemaResponse[];
  specs?: ProductSpecValueResponse[];

  outOfStock?: boolean;
  totalSold?: number;
  images?: ProductImageResponse[];
  variantSchema?: VariantAttributeSchemaResponse[];
  variants: ProductVariantResponse[];
  createdAt: string;

  // Optional fields used by ProductCard for varied API shapes (flash sale, search, etc.)
  image?: string;
  price?: number;
  compareAtPrice?: number;
  oldPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFlashSale?: boolean;
  sold?: number;
  stockQuantity?: number;
}

export interface ProductSpecValueResponse {
  specAttributeId: string;
  name: string;
  code?: string;
  specCode?: string;
  value: string;
  sortOrder?: number;
}

export interface ProductSpecSchemaResponse {
  id: string;
  name: string;
  code: string;
  hint?: string;
  sortOrder?: number;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  displayName?: string;
  variantName?: string;
  variantSignature?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  grossSoldQty?: number;
  returnedQty?: number;
  netSoldQty?: number;
  active?: boolean;
  selections?: ProductVariantAttributeValueResponse[];
  attributes?: ProductVariantAttributeValueResponse[];
  images?: ProductImageResponse[];
}

export interface ProductVariantAttributeValueResponse {
  variantAttributeId: string;
  attributeName?: string;
  attributeCode?: string;
  variantAttributeName: string;
  variantAttributeCode: string;
  optionId: string;
  optionLabel: string;
  optionCode: string;
}

export interface VariantAttributeSchemaResponse {
  id: string;
  name: string;
  code: string;
  sortOrder?: number;
  options: VariantOptionResponse[];
}

export interface VariantOptionResponse {
  id: string;
  label: string;
  code: string;
  sortOrder?: number;
  active?: boolean;
}

export interface ProductImageResponse {
  id: string;
  imageUrl: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  variantId?: string | null;
}

export interface ProductBasicRequest {
  name: string;
  description?: string;
  brandId: string;
  categoryId: string;
  originPrice: number;
  productCode?: string;
  status?: string;
  isFeatured?: boolean;
  specs?: ProductSpecRequest[];
}

export interface ProductRequest extends ProductBasicRequest {
  variants?: ProductVariantRequest[];
  images?: ProductImageRequest[];
}

export interface ProductSpecRequest {
  specAttributeId: string;
  value: string;
}

export interface ProductVariantRequest {
  id?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  active?: boolean;
  selections: ProductVariantSelectionRequest[];
  images?: ProductImageRequest[];
}

export interface ProductVariantSelectionRequest {
  variantAttributeId: string;
  optionId: string;
}

export interface ProductImageRequest {
  imageUrl: string;
  isPrimary?: boolean;
}

export interface ProductVariantsUpdateRequest {
  variants: ProductVariantRequest[];
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  productCount?: number;
  createdAt?: string;
  children?: CategoryResponse[];

  // New schema
  variantAttributes?: VariantAttributeSchemaResponse[];
  specAttributes?: CategorySpecAttributeResponse[];
}

export interface CategorySpecAttributeResponse {
  id: string;
  name: string;
  code: string;
  hint?: string;
  sortOrder?: number;
}

export interface CategoryRequest {
  name: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  variantAttributes?: CategoryVariantAttributeRequest[];
  specAttributes?: CategorySpecAttributeRequest[];
}

export interface CategoryVariantAttributeRequest {
  attributeId?: string;
  name: string;
  code?: string;
  sortOrder?: number;
  options: CategoryVariantOptionRequest[];
}

export interface CategoryVariantOptionRequest {
  id?: string;
  label: string;
  code?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface CategorySpecAttributeRequest {
  attributeId?: string;
  name: string;
  code?: string;
  hint?: string;
  sortOrder?: number;
}

// Brand
export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  productCount?: number;
}

export interface BrandRequest {
  name: string;
  logoUrl?: string;
  description?: string;
}
