//  FlashSale Response
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

//  FlashSale Request (from adminFlashSaleService.ts)
export interface FlashSaleRequest {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  items?: FlashSaleItemRequest[];
}

export interface FlashSaleItemRequest {
  variantId: string;
  flashPrice: number;
  flashStock: number;
}

//  FlashSale Form (from FlashSales.tsx)
export interface FlashSaleItemForm extends FlashSaleItemRequest {
  id?: string;
  productName: string;
  variantName: string;
  originalPrice: number;
  imageUrl: string;
}
