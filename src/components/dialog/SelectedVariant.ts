export interface SelectedVariant {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  originalPrice: number;
  imageUrl: string;
  grossSoldQty?: number;
  returnedQty?: number;
  netSoldQty?: number;
  stockQuantity?: number;
}
