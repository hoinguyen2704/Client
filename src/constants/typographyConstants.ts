import type {
  TypographyFontWeightKey,
  TypographyTextSizeKey,
} from '@/types';

export const TYPOGRAPHY_TEXT_SIZE: Record<TypographyTextSizeKey, string> = {
  xs: 'text-[10px] sm:text-xs',
  sm: 'text-xs sm:text-sm',
  md: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl',
  '2xl': 'text-xl sm:text-2xl',
  caption: 'text-[10px] sm:text-xs',
  label: 'text-xs sm:text-sm',
  body: 'text-sm sm:text-base',
  sectionTitle: 'text-lg sm:text-xl',
  displayIcon: 'text-2xl sm:text-3xl',
};

export const TYPOGRAPHY_FONT_WEIGHT: Record<TypographyFontWeightKey, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  black: 'font-black',
};

export const TYPOGRAPHY_TEXT_STYLE = {
  sectionTitle: `${TYPOGRAPHY_TEXT_SIZE.sectionTitle} ${TYPOGRAPHY_FONT_WEIGHT.bold}`,
  body: `${TYPOGRAPHY_TEXT_SIZE.body} ${TYPOGRAPHY_FONT_WEIGHT.medium}`,
  bodyStrong: `${TYPOGRAPHY_TEXT_SIZE.body} ${TYPOGRAPHY_FONT_WEIGHT.semibold}`,
  button: `${TYPOGRAPHY_TEXT_SIZE.body} ${TYPOGRAPHY_FONT_WEIGHT.semibold}`,
  chip: `${TYPOGRAPHY_TEXT_SIZE.label} ${TYPOGRAPHY_FONT_WEIGHT.medium}`,
  chipStrong: `${TYPOGRAPHY_TEXT_SIZE.label} ${TYPOGRAPHY_FONT_WEIGHT.semibold}`,
  label: `${TYPOGRAPHY_TEXT_SIZE.label} ${TYPOGRAPHY_FONT_WEIGHT.semibold} uppercase tracking-wider`,
  helper: TYPOGRAPHY_TEXT_SIZE.label,
  microBadge: `${TYPOGRAPHY_TEXT_SIZE.caption} ${TYPOGRAPHY_FONT_WEIGHT.bold}`,
} as const;
