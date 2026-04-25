//  Cart Response (API)
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
  available?: boolean;
  issueCode?: string;
  issueMessage?: string;
}

//  Cart Item (UI)
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}
