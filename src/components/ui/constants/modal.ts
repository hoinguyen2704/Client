import type { ModalSize, StarSize } from '../types';

// ─── Modal size → Tailwind class map ─────────────────────────────
export const MODAL_SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  '5xl': 'max-w-7xl',
};

// ─── StarRating labels & size classes ────────────────────────────
export const STAR_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Kém',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
};

export const STAR_SIZE_CLASS: Record<StarSize, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};
