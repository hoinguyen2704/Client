export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
  discount: number;
  category: string;
  brand: string;
  isNew?: boolean;
  isFlashSale?: boolean;
  specs?: Record<string, string>;
}

export interface ProductGalleryProps {
  images: string[];
  activeImage: number;
  onImageChange: (idx: number) => void;
  productName: string;
  discount: number;
}

export interface ProductInfoProps {
  product: Product;
}

export interface ProductTabsProps {
  product: { name: string; image: string; rating: number; reviews: number };
  images: string[];
}
