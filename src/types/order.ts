//  Order
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
  shippingDiscountAmount?: number;
  taxPercent?: number;
  taxMode?: "INCLUDED" | "EXCLUDED";
  taxableAmount?: number;
  taxAmount?: number;
  taxApplyOnShipping?: boolean;
  totalAmount: number;
  couponCode?: string;
  shippingCouponCode?: string;
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

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  itemCount?: number;
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
  shippingCouponCode?: string;
  note?: string;
  items: CheckoutItem[];
}

export interface CheckoutItem {
  variantId: string;
  quantity: number;
  expectedUnitPrice?: number;
}

// Return / Refund
export interface ReturnRequestResponse {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: string;
  refundStatus: string;
  reason: string;
  evidenceNote?: string;
  adminNote?: string;
  requestedAmount: number;
  approvedAmount?: number;
  refundAmount?: number;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  items: ReturnItemData[];
  refunds: RefundTransactionData[];
  statusHistories?: ReturnStatusHistory[];
}

export interface ReturnStatusHistory {
  id: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface ReturnItemData {
  id: string;
  orderItemId: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  unitPrice: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  lineAmount: number;
}

export interface RefundTransactionData {
  id: string;
  idempotencyKey: string;
  provider: string;
  transactionId?: string;
  status: string;
  amount: number;
  currency: string;
  failureReason?: string;
  createdAt: string;
}

export interface CreateReturnRequestPayload {
  orderId: string;
  reason: string;
  evidenceNote?: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
  }>;
}

export interface ReviewReturnRequestPayload {
  approved: boolean;
  approvedAmount?: number;
  note?: string;
}

export interface UpdateReturnStatusRequestPayload {
  status: string;
  note?: string;
}

export interface ProcessRefundRequestPayload {
  amount: number;
  provider: string;
  transactionId: string;
  adminNote: string;
  currency?: string;
  rawPayload?: string;
}
