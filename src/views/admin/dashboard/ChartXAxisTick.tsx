import { ChartXAxisTickProps } from './ChartXAxisTickProps';
import { useTranslation } from 'react-i18next';

export default function ChartXAxisTick({ x = 0, y = 0, payload }: ChartXAxisTickProps) {
  const { t } = useTranslation('adminDashboard');
  if (!payload) return null;

  const raw = payload.value;
  const isToday = raw.includes('|_TODAY');
  const clean = raw.replace('|_TODAY', '');
  const parts = clean.split('|');

  // WEEK format: "Mon|6/4"
  const isWeekLabel = parts.length >= 2;
  const line1 = isWeekLabel ? parts[0] : '';

  // MONTH format: "6/4"
  const monthMatch = !isWeekLabel ? parts[0].match(/^(\d{1,2})\/(\d{1,2})$/) : null;
  const isMonthLabel = Boolean(monthMatch);
  const dayNumber = monthMatch ? Number(monthMatch[1]) : null;

  // YEAR format may arrive as "Month 4", "4", or a localized month label with a trailing number.
  const yearMatch = !isWeekLabel ? parts[0].match(/(\d{1,2})$/) : null;
  const isYearLabel = Boolean(yearMatch);
  const monthNumber = yearMatch ? Number(yearMatch[1]) : null;

  // Reduce tick density for month/year to avoid overlap.
  let shouldRender = true;
  if (isMonthLabel && dayNumber !== null) {
    shouldRender = isToday || dayNumber === 1 || dayNumber % 4 === 1;
  } else if (isYearLabel && monthNumber !== null) {
    shouldRender = isToday || monthNumber % 2 === 1 || monthNumber === 12;
  }
  if (!shouldRender) return null;

  const line2 = isWeekLabel
    ? parts[1]
    : isMonthLabel && dayNumber !== null
      ? `${dayNumber}`
      : isYearLabel && monthNumber !== null
        ? `T${monthNumber}`
        : parts[0];

  const textColor = isToday ? '#2563eb' : '#64748b';
  const fontWeight = isToday ? 700 : 500;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Today indicator dot */}
      {isToday && (
        <>
          <circle cx={0} cy={-6} r={3} fill="#2563eb" />
          <circle cx={0} cy={-6} r={6} fill="#2563eb" opacity={0.15} />
        </>
      )}

      {/* Day of week (line 1) */}
      {isWeekLabel && (
        <text
          x={0}
          y={5}
          dy={0}
          textAnchor="middle"
          fill={isToday ? '#2563eb' : '#94a3b8'}
          fontSize={10}
          fontWeight={isToday ? 700 : 500}
        >
          {line1}
        </text>
      )}

      {/* Date (line 2) */}
      <text
        x={0}
        y={isWeekLabel ? 17 : 9}
        dy={0}
        textAnchor="middle"
        fill={textColor}
        fontSize={isToday ? 12 : 11}
        fontWeight={fontWeight}
      >
        {line2}
      </text>

      {/* Today label */}
      {isToday && (
        <text
          x={0}
          y={isWeekLabel ? 30 : 21}
          dy={0}
          textAnchor="middle"
          fill="#2563eb"
          fontSize={9}
          fontWeight={700}
        >
          {t('overview.today')}
        </text>
      )}
    </g>
  );
}
