import type { ProductResponse, ProductImageResponse } from './product';
import type { BannerResponse } from './cms';

//  Flash Sale / Promotion Countdown
export interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

//  Home Page Data (from Home.tsx)
export interface HomeData {
  banners: BannerResponse[];
  featured: ProductResponse[];
  newArrivals: ProductResponse[];
  bestSellers: ProductResponse[];
}

//  Product Form types (from ProductForm.tsx)
export interface VariantFormData {
  id?: string;
  sku: string;
  variantName: string;
  price: number | "";
  compareAtPrice: number | "";
  stock: number | "";
  active: boolean;
  images: ProductImageResponse[];
  pendingFiles: File[];
}

export interface SpecRow {
  key: string;
  value: string;
}

//  Category admin form (from Categories.tsx)
export interface SpecTemplateRow {
  specKey: string;
  hint: string;
  sortOrder: number;
}

//  Compare page (from Compare.tsx)
export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  brand?: string;
  rating?: number;
  specs?: Record<string, string>;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
}
