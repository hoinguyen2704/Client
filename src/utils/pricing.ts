import type {
  FlashSaleItemResponse,
  FlashSaleResponse,
  ProductResponse,
  ProductVariantResponse,
} from '@/types';

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const calculateDiscountPercent = (originPrice: number, salePrice: number): number => {
  if (originPrice <= 0 || salePrice <= 0 || salePrice >= originPrice) return 0;
  return Math.round(((originPrice - salePrice) / originPrice) * 100);
};

export const isFlashItemActive = (item?: FlashSaleItemResponse | null): item is FlashSaleItemResponse => {
  if (!item) return false;
  return toNumber(item.flashPrice) > 0 && toNumber(item.remainingStock) > 0;
};

export const buildFlashSaleItemMap = (
  saleOrSales?: FlashSaleResponse | FlashSaleResponse[] | null,
): Record<string, FlashSaleItemResponse> => {
  const sales = Array.isArray(saleOrSales)
    ? saleOrSales
    : saleOrSales
      ? [saleOrSales]
      : [];

  return sales.reduce<Record<string, FlashSaleItemResponse>>((acc, sale) => {
    (sale?.items || []).forEach((item) => {
      if (!item?.variantId) return;
      if (!isFlashItemActive(item)) return;

      const existing = acc[item.variantId];
      if (!existing) {
        acc[item.variantId] = item;
        return;
      }

      const existingPrice = toNumber(existing.flashPrice, Number.MAX_SAFE_INTEGER);
      const nextPrice = toNumber(item.flashPrice, Number.MAX_SAFE_INTEGER);
      if (nextPrice < existingPrice) {
        acc[item.variantId] = item;
      }
    });
    return acc;
  }, {});
};

export const buildFlashSaleItemMapFromItems = (
  items?: FlashSaleItemResponse[] | null,
): Record<string, FlashSaleItemResponse> => (
  (items || []).reduce<Record<string, FlashSaleItemResponse>>((acc, item) => {
    if (!item?.variantId) return acc;
    if (!isFlashItemActive(item)) return acc;

    const existing = acc[item.variantId];
    if (!existing) {
      acc[item.variantId] = item;
      return acc;
    }

    const existingPrice = toNumber(existing.flashPrice, Number.MAX_SAFE_INTEGER);
    const nextPrice = toNumber(item.flashPrice, Number.MAX_SAFE_INTEGER);
    if (nextPrice < existingPrice) {
      acc[item.variantId] = item;
    }
    return acc;
  }, {})
);

interface ResolveVariantPricingInput {
  product: Pick<ProductResponse, 'originPrice' | 'lowestPrice'>;
  variant?: ProductVariantResponse | null;
  flashItem?: FlashSaleItemResponse | null;
}

export interface ResolvedVariantPricing {
  salePrice: number;
  originPrice: number;
  discount: number;
  isFlashSale: boolean;
}

export const resolveVariantPricing = ({
  product,
  variant,
  flashItem,
}: ResolveVariantPricingInput): ResolvedVariantPricing => {
  const baseSalePrice = toNumber(
    variant?.price,
    toNumber(product.lowestPrice, toNumber(product.originPrice)),
  );

  const variantComparePrice = toNumber(variant?.compareAtPrice);
  const productOriginPrice = toNumber(product.originPrice);
  const defaultOriginPrice = variantComparePrice > baseSalePrice
    ? variantComparePrice
    : Math.max(productOriginPrice, baseSalePrice);

  if (isFlashItemActive(flashItem)) {
    const flashPrice = toNumber(flashItem.flashPrice, baseSalePrice);
    const flashOriginPrice = toNumber(flashItem.originalPrice, defaultOriginPrice);
    const resolvedOriginPrice = flashOriginPrice > flashPrice
      ? flashOriginPrice
      : Math.max(defaultOriginPrice, flashPrice);
    return {
      salePrice: flashPrice,
      originPrice: resolvedOriginPrice,
      discount: calculateDiscountPercent(resolvedOriginPrice, flashPrice),
      isFlashSale: true,
    };
  }

  return {
    salePrice: baseSalePrice,
    originPrice: defaultOriginPrice,
    discount: calculateDiscountPercent(defaultOriginPrice, baseSalePrice),
    isFlashSale: false,
  };
};
