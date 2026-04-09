//  Coupon
export interface ApplicableProductInfo {
  id: string;
  name: string;
  slug: string;
  mainImageUrl?: string;
}

export interface CouponResponse {
  id: string;
  code: string;
  discountType: string;
  couponCategory?: string; // PRODUCT, SHIPPING
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: string;
  isPublic?: boolean;
  applyType?: string; // ALL | SPECIFIC_PRODUCTS
  applicableProducts?: ApplicableProductInfo[];
  saved?: boolean;
}

export interface CouponRequest {
  code: string;
  discountType: string;
  couponCategory?: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  isPublic?: boolean;
  applyType?: string;
  applicableProductIds?: string[];
}
