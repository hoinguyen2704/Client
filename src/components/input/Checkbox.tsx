import type { ChangeEvent } from 'react';
import { FiCheck } from 'react-icons/fi';
import { cn } from '@/utils/cn';
import type { CheckboxProps } from '../ui/types';

export default function Checkbox({
  className = '',
  onCheckedChange,
  onChange,
  ...rest
}: CheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  return (
    <span className="relative inline-flex items-center justify-center">
      <input
        type="checkbox"
        className={cn(
          'peer appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/30',
          className,
        )}
        onChange={handleChange}
        {...rest}
      />
      <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3] text-sm" />
    </span>
  );
}
