import type { TypographyTextSizeKey } from '@/types/typography';

export const TYPOGRAPHY_TEXT_SIZE: Record<TypographyTextSizeKey, string> = {
  xs: 'text-8 sm:text-10',
  sm: 'text-10 sm:text-sm',
  md: 'text-sm sm:text-sm',
  lg: 'text-sm sm:text-base',
  xl: 'text-base sm:text-lg',
  '2xl': 'text-lg sm:text-xl',
};
