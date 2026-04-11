import type { TypographyTextSizeKey } from '@/types/typography';

export const TYPOGRAPHY_TEXT_SIZE: Record<TypographyTextSizeKey, string> = {
  xs: 'text-[8px] sm:text-[10px]',
  sm: 'text-[10px] sm:text-xs',
  md: 'text-xs sm:text-sm',
  lg: 'text-sm sm:text-base',
  xl: 'text-base sm:text-lg',
  '2xl': 'text-lg sm:text-xl',
};
