// ─── Order ───────────────────────────────────────────────────────
export interface OrderResponse {
  id: string;
  orderNumber: string;
  trackingCode?: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  note?: string;
  shippingAddress: string;
  paymentUrl?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItemResponse[];
  statusHistories?: OrderStatusHistory[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface OrderItemResponse {
  id: string;
  variantId: string;
  productId?: string;
  productName: string;
  variantName: string;
  imageUrl?: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutRequest {
  addressId: string;
  paymentMethod: string;
  couponCode?: string;
  note?: string;
  items: CheckoutItem[];
}

export interface CheckoutItem {
  variantId: string;
  quantity: number;
}

// ─── Feedback ────────────────────────────────────────────────────
export interface FeedbackResponse {
  id: string;
  rating: number;
  content: string;
  imagesJson?: string;
  status: string;
  createdAt: string;
  productId: string;
  productName?: string;
  variantId?: string;
  variantName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  orderId?: string;
  adminReply?: string;
  repliedAt?: string;
  editCount?: number;
}

export interface FeedbackRequest {
  productId: string;
  variantId?: string;
  orderId?: string;
  rating: number;
  content: string;
  imagesJson?: string;
}

// ─── Coupon ──────────────────────────────────────────────────────
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

// ─── FlashSale ───────────────────────────────────────────────────
export interface FlashSaleResponse {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  items: FlashSaleItemResponse[];
  createdAt?: string;
}

export interface FlashSaleItemResponse {
  id: string;
  productId: string;
  productSlug: string;
  variantId: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  originalPrice: number;
  flashPrice: number;
  flashStock: number;
  soldCount: number;
  remainingStock: number;
}

// ─── Ticket ─────────────────────────────────────────────────────
export interface TicketRequest {
  subject: string;
  content: string;
  attachmentsJson?: string;
}

export interface TicketMessageRequest {
  content: string;
  attachmentsJson?: string;
}

export interface TicketResponse {
  id: string;
  ticketNumber?: string;
  subject: string;
  status: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  messages: TicketMessageResponse[];
}

export interface TicketMessageResponse {
  id: string;
  senderType: string; // USER, ADMIN, AI_BOT
  content: string;
  attachmentsJson?: string;
  createdAt: string;
}

// ─── Notification ───────────────────────────────────────────────
export interface NotificationResponse {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  orderId?: string;
  createdAt: string;
}

// ─── Wishlist ───────────────────────────────────────────────────
export interface WishlistResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  productPrice: number;
  productCompareAtPrice?: number;
  productThumbnailUrl?: string;
  addedAt: string;
}

// ─── Address ────────────────────────────────────────────────────
export interface AddressResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface AddressRequest {
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault?: boolean;
}

export interface CartResponse {
  id: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  subtotal: number;
  stockQuantity: number;
}

// ─── Banner / Article (CMS) ─────────────────────────────────────
export interface BannerResponse {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface DashboardStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  newOrders?: number;
  totalCustomers: number;
  newCustomers?: number;
  productsSold?: number;
  cancelledOrders?: number;
  returnedOrders?: number;
  totalFeedbacks?: number;
  newFeedbacks?: number;
  revenueChart?: RevenueChartItem[];
  topProducts?: TopProductItem[];
  topCategories?: TopCategoryItem[];
  topCustomers?: TopCustomerItem[];
  recentOrders?: RecentOrderItem[];
  ratingDistribution?: Record<number, number>;
}

export interface RevenueChartItem {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  imageUrl?: string;
  totalSold: number;
  revenue: number;
}

export interface TopCategoryItem {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface TopCustomerItem {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface RecentOrderItem {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

// ─── User (admin view) ─────────────────────────────────────────
export interface UserResponse {
  id: string;
  userName?: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
}

// ─── Setting ────────────────────────────────────────────────────
export interface SettingResponse {
  id: string;
  groupName: string;
  settingKey: string;
  settingValue: string;
  valueType: string;
  description?: string;
  updatedAt?: string;
}

export interface ShippingConfig {
  defaultShippingFee: number;
  freeShippingThreshold: number;
}

export interface PaymentMethodConfig {
  id: string;
  label: string;
  enabled: boolean;
}

