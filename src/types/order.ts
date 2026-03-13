// ─── Order ───────────────────────────────────────────────────────
export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  note?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productThumbnail?: string;
  variantId: string;
  variantInfo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CheckoutRequest {
  addressId: string;
  paymentMethod: string;
  couponCode?: string;
  note?: string;
}

// ─── Feedback ────────────────────────────────────────────────────
export interface FeedbackResponse {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  productName?: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface FeedbackRequest {
  productId: string;
  rating: number;
  comment: string;
}

// ─── Coupon ──────────────────────────────────────────────────────
export interface CouponResponse {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface CouponRequest {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
}

// ─── FlashSale ───────────────────────────────────────────────────
export interface FlashSaleResponse {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  items: FlashSaleItemResponse[];
}

export interface FlashSaleItemResponse {
  id: string;
  productId: string;
  productName: string;
  productThumbnail?: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  soldCount: number;
}

// ─── Ticket ─────────────────────────────────────────────────────
export interface TicketResponse {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  messages: TicketMessageResponse[];
}

export interface TicketMessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

// ─── Notification ───────────────────────────────────────────────
export interface NotificationResponse {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

// ─── Wishlist ───────────────────────────────────────────────────
export interface WishlistResponse {
  id: string;
  productId: string;
  productName: string;
  productThumbnail?: string;
  productPrice: number;
  createdAt: string;
}

// ─── Address ────────────────────────────────────────────────────
export interface AddressResponse {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

// ─── Cart ───────────────────────────────────────────────────────
export interface CartResponse {
  id: string;
  productId: string;
  productName: string;
  productThumbnail?: string;
  variantId: string;
  variantInfo: string;
  price: number;
  quantity: number;
}

// ─── Banner / Article (CMS) ─────────────────────────────────────
export interface BannerResponse {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status: string;
  createdAt: string;
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface DashboardStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

// ─── User (admin view) ─────────────────────────────────────────
export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
}
