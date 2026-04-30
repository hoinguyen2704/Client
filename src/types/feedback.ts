//  Feedback
export interface FeedbackResponse {
  id: string;
  rating: number;
  content: string;
  imagesJson?: string;
  status: string;
  createdAt: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  variantId?: string;
  variantSku?: string;
  variantName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  orderId?: string;
  orderNumber?: string;
  adminReply?: string;
  repliedAt?: string;
  editCount?: number;
}

export interface FeedbackFilterSummaryResponse {
  total: number;
  withContent: number;
  ratingCounts: Record<number, number>;
}

export interface ProductFeedbackPageResponse {
  data: FeedbackResponse[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  summary: FeedbackFilterSummaryResponse;
}

export type ProductReviewFilter = 'all' | 'with-comment' | 1 | 2 | 3 | 4 | 5;

export interface FeedbackRequest {
  productSlug: string;
  variantSku?: string;
  orderNumber?: string;
  rating: number;
  content: string;
  imagesJson?: string;
}

export interface ReviewComposerItem {
  productName: string;
  variantName?: string;
  orderNumber?: string;
  productImage?: string;
}

export interface ReviewComposerSubmitData {
  rating: number;
  content: string;
  imageFiles: File[];
}

export interface FeedbackStatusUpdateRequest {
  status: string;
}

export interface FeedbackReplyRequest {
  reply: string;
}

export interface FeedbackExportParams {
  status?: string;
  productId?: string;
}

export interface ProductFeedbackQueryParams {
  page?: number;
  size?: number;
  rating?: number;
  hasComment?: boolean;
}

//  Review UI types (from MyReviews.tsx)
export type ReviewTab = 'to-review' | 'reviewed';

export interface ReviewableItem {
  itemKey: string;
  orderNumber: string;
  productSlug: string;
  variantSku?: string;
  productName: string;
  variantName: string;
  productImage?: string;
  deliveredAt: string;
  feedbacks: FeedbackResponse[];
}

export interface ReviewedEntry {
  key: string;
  itemKey: string;
  orderNumber: string;
  productSlug: string;
  variantSku?: string;
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
