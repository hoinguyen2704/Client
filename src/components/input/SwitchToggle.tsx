import { cn } from '@/utils/cn';
import type { SwitchToggleProps } from '../ui/types';

const SIZE_MAP = {
  sm: {
    track: 'w-10 h-5',
    knob: 'w-4 h-4',
    move: 'translate-x-5',
  },
  md: {
    track: 'w-12 h-6',
    knob: 'w-5 h-5',
    move: 'translate-x-6',
  },
} as const;

const TONE_MAP = {
  primary: 'bg-purple-500',
  success: 'bg-green-500',
  blue: 'bg-blue-500',
  slate: 'bg-slate-500',
} as const;

export default function SwitchToggle({
  checked,
  onChange,
  disabled = false,
  tone = 'primary',
  className = '',
  size = 'md',
  ariaLabel,
}: SwitchToggleProps) {
  const s = SIZE_MAP[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center rounded-full transition-colors',
        s.track,
        checked ? TONE_MAP[tone] : 'bg-slate-200 dark:bg-slate-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 rounded-full bg-white shadow-sm transition-transform',
          s.knob,
          checked ? s.move : 'translate-x-0',
        )}
      />
    </button>
  );
}
