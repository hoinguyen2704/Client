export const parseOptionalIntegerInputValue = (rawValue: string): number | "" => {
  const digitsOnly = rawValue.replace(/\D+/g, "");
  if (!digitsOnly) return "";
  return Number.parseInt(digitsOnly, 10);
};

export const parseRequiredIntegerInputValue = (
  rawValue: string,
  emptyValue = 0,
): number => {
  const parsedValue = parseOptionalIntegerInputValue(rawValue);
  return parsedValue === "" ? emptyValue : parsedValue;
};

export const sanitizeOptionalIntegerInputString = (rawValue: string): string => {
  const parsedValue = parseOptionalIntegerInputValue(rawValue);
  return parsedValue === "" ? "" : String(parsedValue);
};

export const clampNonNegativeInteger = (
  value: number,
  maxValue?: number,
): number => {
  const normalizedValue = Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
  return maxValue == null
    ? normalizedValue
    : Math.min(normalizedValue, maxValue);
};

export const clampIntegerRange = (
  value: number,
  minValue: number,
  maxValue: number,
): number => {
  const normalizedValue = Number.isFinite(value)
    ? Math.trunc(value)
    : minValue;
  return Math.min(Math.max(normalizedValue, minValue), maxValue);
};
