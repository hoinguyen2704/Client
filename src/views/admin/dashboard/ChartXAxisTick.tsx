import { ChartXAxisTickProps } from './ChartXAxisTickProps';

export default function ChartXAxisTick({ x = 0, y = 0, payload }: ChartXAxisTickProps) {
  if (!payload) return null;

  const raw = payload.value;
  const isToday = raw.includes('|_TODAY');
  const clean = raw.replace('|_TODAY', '');
  const parts = clean.split('|');

  // Determine if it's a WEEK label (2 parts: dayName|date) or single part
  const hasDay = parts.length >= 2;
  const line1 = hasDay ? parts[0] : '';     // e.g. "T2" or ""
  const line2 = hasDay ? parts[1] : parts[0]; // e.g. "6/4" or "Tháng 4"

  const textColor = isToday ? '#7c3aed' : '#64748b';
  const fontWeight = isToday ? 700 : 500;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Today indicator dot */}
      {isToday && (
        <>
          <circle cx={0} cy={-6} r={3} fill="#7c3aed" />
          <circle cx={0} cy={-6} r={6} fill="#7c3aed" opacity={0.15} />
        </>
      )}

      {/* Day of week (line 1) */}
      {hasDay && (
        <text
          x={0}
          y={6}
          dy={0}
          textAnchor="middle"
          fill={isToday ? '#7c3aed' : '#94a3b8'}
          fontSize={10}
          fontWeight={isToday ? 700 : 500}
        >
          {line1}
        </text>
      )}

      {/* Date (line 2) */}
      <text
        x={0}
        y={hasDay ? 20 : 10}
        dy={0}
        textAnchor="middle"
        fill={textColor}
        fontSize={isToday ? 13 : 12}
        fontWeight={fontWeight}
      >
        {line2}
      </text>

      {/* "Hôm nay" label */}
      {isToday && (
        <text
          x={0}
          y={hasDay ? 34 : 24}
          dy={0}
          textAnchor="middle"
          fill="#7c3aed"
          fontSize={9}
          fontWeight={700}
        >
          Hôm nay
        </text>
      )}
    </g>
  );
}
