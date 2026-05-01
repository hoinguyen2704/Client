export type ProductPublicStatusState =
  | 'available'
  | 'inactive'
  | 'draft'
  | 'comingSoon'
  | 'outOfStock';

export const getProductPublicStatusState = (
  status?: string,
): ProductPublicStatusState => {
  switch (status) {
    case 'INACTIVE':
      return 'inactive';
    case 'DRAFT':
      return 'draft';
    case 'COMING_SOON':
      return 'comingSoon';
    case 'OUT_OF_STOCK':
      return 'outOfStock';
    default:
      return 'available';
  }
};

export const isProductStatusPurchasable = (status?: string): boolean =>
  getProductPublicStatusState(status) === 'available';
