// ─── Product ────────────────────────────────────────────────────
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  images: string[];
  basePrice: number;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  status: string;
  averageRating?: number;
  totalFeedbacks?: number;
  variants: ProductVariantResponse[];
  createdAt: string;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  color?: string;
  storage?: string;
  ram?: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  basePrice: number;
  categoryId?: string;
  brandId?: string;
  variants: ProductVariantRequest[];
}

export interface ProductVariantRequest {
  sku: string;
  color?: string;
  storage?: string;
  ram?: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

// ─── Category ───────────────────────────────────────────────────
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  icon?: string;
  isActive: boolean;
  children?: CategoryResponse[];
}

export interface CategoryRequest {
  name: string;
  parentId?: string;
  icon?: string;
}

// ─── Brand ──────────────────────────────────────────────────────
export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface BrandRequest {
  name: string;
  logo?: string;
  description?: string;
}
