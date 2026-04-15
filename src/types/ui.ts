import type {
  ProductResponse,
  ProductImageResponse,
  ProductVariantResponse,
  VariantAttributeSchemaResponse,
} from './product';
import type { BannerResponse } from './cms';
import type { ResolvedVariantPricing } from '@/utils/pricing';

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
  uiKey?: string;
  displayOrder?: number;
  sku: string;
  skuMode?: 'suggested' | 'manual';
  variantName: string;
  variantSignature?: string;
  selections: Record<string, string>;
  price: number | "";
  compareAtPrice: number | "";
  stock: number | "";
  grossSoldQty?: number;
  returnedQty?: number;
  netSoldQty?: number;
  active: boolean;
  images: ProductImageResponse[];
  pendingFiles: File[];
}

export interface SpecRow {
  specAttributeId?: string;
  key: string;
  value: string;
}

export interface VariantSchemaSelectionProps {
  variantSchema: VariantAttributeSchemaResponse[];
  selections: Record<string, string>;
  onChange: (attributeId: string, optionId: string) => void;
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

//  Variant Selector (from VariantSelector.tsx)
export interface VariantSelectorProps {
  /** List of product variants to display */
  variants: ProductVariantResponse[];
  /** Schema returned by product detail for ordered multi-attribute rendering */
  variantSchema?: VariantAttributeSchemaResponse[];
  /** Pre-computed pricing for each variant, keyed by variant id */
  pricingMap: Record<string, ResolvedVariantPricing>;
  /** Currently selected variant index (fallback sync for gallery and legacy mode) */
  selectedIndex: number;
  /** Callback fired when a concrete variant is selected */
  onSelect: (index: number) => void;
  /** Selection state map (attributeId -> optionId) */
  selectedOptions: Record<string, string>;
  /** Callback fired when user chooses an option inside an attribute group */
  onSelectOption: (attributeId: string, optionId: string) => void;
  /** Section label (default: "Phiên bản") */
  label?: string;
  /** Additional class name for the root wrapper */
  className?: string;
}

//  Expand / Collapse Toggle (from ExpandToggle.tsx)
export interface ExpandToggleProps {
  /** Whether the content is currently expanded */
  expanded: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Label shown when collapsed (default: "Xem thêm") */
  expandLabel?: string;
  /** Label shown when expanded (default: "Thu gọn") */
  collapseLabel?: string;
  /** Visual variant: "text" (minimal) or "outline" (bordered) */
  variant?: 'text' | 'outline';
  /** Additional class name */
  className?: string;
}

// Voucher / Coupon UI
import type { CouponResponse } from '@/types/coupon';

export interface VoucherCardProps {
  v: CouponResponse;
  showSaveBtn?: boolean;
  isSaving: boolean;
  onCopy: (code: string) => void;
  onSave: (v: CouponResponse) => void;
  onUnsave: (id: string) => void;
}

export interface VoucherSectionProps {
  iconType: 'gift' | 'bookmark';
  title: string;
  badgeClass: string;
  vouchers: CouponResponse[];
  savingId: string | null;
  expanded: boolean;
  onToggle: () => void;
  loading?: boolean;
  minToExpand?: number;
  onCopy: (code: string) => void;
  onSave: (v: CouponResponse) => void;
  onUnsave: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}

// Notification UI
export interface NotificationDropdownProps {
  /** Size variant for bell icon */
  iconSize?: string;
}
