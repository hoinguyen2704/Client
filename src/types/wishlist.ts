//  Wishlist
export interface WishlistResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productCompareAtPrice?: number;
  productThumbnailUrl?: string;
  addedAt: string;
}
