// ─── Product ────────────────────────────────────────────────────
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mainImageUrl?: string;
  brandId?: string;
  brandName?: string;
  category?: CategoryResponse;
  originPrice: number;
  lowestPrice?: number;
  averageRating?: number;
  totalReviews?: number;
  status: string;
  isFeatured?: boolean;
  specsJson?: string;
  outOfStock?: boolean;
  images?: ProductImageResponse[];
  variants: ProductVariantResponse[];
  createdAt: string;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  variantName?: string;
  color?: string;
  storageCapacity?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  active?: boolean;
  images?: ProductImageResponse[];
}

export interface ProductImageResponse {
  id: string;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface ProductRequest {
  name: string;
  description?: string;
  brandId?: string;
  categoryId?: string;
  originPrice: number;
  specsJson?: string;
  status?: string;
  isFeatured?: boolean;
  variants?: ProductVariantRequest[];
  images?: ProductImageRequest[];
}

export interface ProductVariantRequest {
  sku: string;
  variantName: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  active?: boolean;
  images?: ProductImageRequest[];
}

export interface ProductImageRequest {
  imageUrl: string;
  isPrimary?: boolean;
}

export interface SpecTemplateResponse {
  id: string;
  specKey: string;
  hint?: string;
  sortOrder?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt?: string;
  children?: CategoryResponse[];
  specTemplates?: SpecTemplateResponse[];
}

export interface CategoryRequest {
  name: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  specTemplates?: { specKey: string; hint?: string; sortOrder?: number }[];
}

// ─── Brand ──────────────────────────────────────────────────────
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
