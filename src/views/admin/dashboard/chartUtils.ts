export const DASHBOARD_CHART_AXIS_COLOR = '#0f172a';
export const DASHBOARD_CHART_GRID_COLOR = '#9eb2cb';
export const DASHBOARD_CHART_TOOLTIP_STYLE = {
  borderRadius: '14px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  boxShadow: '0 16px 40px -18px rgb(15 23 42 / 0.35)',
  padding: '10px 12px',
};

export const DASHBOARD_AREA_CHART_MARGIN = {
  top: 14,
  right: 28,
  left: 12,
  bottom: 36,
};

const COMPACT_SUFFIXES = [
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'K' },
] as const;

function formatDecimal(value: number, maximumFractionDigits: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

export function formatCompactNumber(value: number, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return '0';

  const absValue = Math.abs(value);
  const compactUnit = COMPACT_SUFFIXES.find((unit) => absValue >= unit.value);

  if (!compactUnit) {
    if (Number.isInteger(value)) {
      return value.toLocaleString('vi-VN');
    }

    return value.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  const scaledValue = value / compactUnit.value;
  const fractionDigits = Math.abs(scaledValue) >= 10 ? 0 : maximumFractionDigits;

  return `${formatDecimal(scaledValue, fractionDigits)}${compactUnit.suffix}`;
}

export function formatRevenueAxisValue(value: number) {
  return formatCompactNumber(value, 1);
}

export function formatOrderAxisValue(value: number) {
  if (!Number.isFinite(value)) return '0';

  if (Math.abs(value) >= 1000) {
    return formatCompactNumber(value, 1);
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString('vi-VN');
  }

  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function getYAxisWidth(
  values: number[],
  formatter: (value: number) => string,
  minWidth = 56,
  maxWidth = 92,
) {
  const labels = values.length > 0 ? values : [0];
  const longestLabelLength = labels
    .map((value) => formatter(value).length)
    .reduce((maxLength, length) => Math.max(maxLength, length), 0);

  return Math.min(maxWidth, Math.max(minWidth, 24 + longestLabelLength * 8));
}
