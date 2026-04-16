type NullableNumber = number | null | undefined;

export interface VariantSalesInput {
  grossSoldQty?: NullableNumber;
  totalSold?: NullableNumber;
  returnedQty?: NullableNumber;
  netSoldQty?: NullableNumber;
}

export interface VariantSalesMetrics {
  gross: number;
  returned: number;
  net: number;
}

const toNonNegativeNumber = (value: NullableNumber): number => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }
  return num;
};

export const resolveVariantSalesMetrics = (
  input?: VariantSalesInput | null,
): VariantSalesMetrics => {
  const source = input || {};
  const gross = toNonNegativeNumber(source.grossSoldQty ?? source.totalSold);
  const returned = toNonNegativeNumber(source.returnedQty);
  const net = source.netSoldQty == null
    ? Math.max(gross - returned, 0)
    : toNonNegativeNumber(source.netSoldQty);

  return { gross, returned, net };
};
