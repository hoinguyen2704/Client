import type { ChangeEvent } from 'react';
import { cn } from '@/utils/cn';
import type { RadioProps } from '../ui/types';

export default function Radio({
  className = '',
  onCheckedChange,
  onChange,
  ...rest
}: RadioProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  return (
    <input
      type="radio"
      className={cn(
        'appearance-none w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 checked:border-[6px] checked:border-purple-600 dark:checked:border-purple-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30',
        className,
      )}
      onChange={handleChange}
      {...rest}
    />
  );
}
