//  Feedback
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

//  Review UI types (from MyReviews.tsx)
export type ReviewTab = 'to-review' | 'reviewed';

export interface ReviewableItem {
  itemKey: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  productImage?: string;
  deliveredAt: string;
  feedbacks: FeedbackResponse[];
}

export interface ReviewedEntry {
  key: string;
  itemKey: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  productImage?: string;
  review: FeedbackResponse;
  round: number;
  totalRounds: number;
}

export interface ReviewCandidate {
  itemKey: string;
  order: import('./order').OrderResponse;
  item: import('./order').OrderItemResponse;
}
