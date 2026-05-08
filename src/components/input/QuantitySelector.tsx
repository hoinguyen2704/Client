import { useEffect, useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import {
  parseOptionalIntegerInputValue,
  sanitizeOptionalIntegerInputString,
} from '@/utils/numericInput';
import type { QuantitySelectorProps } from '../ui/types';

const sizeConfig = {
  sm: {
    wrapper: 'rounded-lg',
    button: 'w-8 h-8 rounded-md text-md',
    input: 'w-10 h-8 text-md',
  },
  md: {
    wrapper: 'rounded-2xl p-1',
    button: 'w-10 h-10 rounded-xl shadow-sm text-base',
    input: 'w-16 h-10 text-lg',
  },
};

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = 'md',
  disabled = false,
  overMaxWarning,
  className = '',
}: QuantitySelectorProps) {
  const s = sizeConfig[size];
  const clampValue = (nextValue: number) => {
    const normalizedValue = Number.isFinite(nextValue)
      ? Math.trunc(nextValue)
      : min;

    if (max !== Infinity) {
      return Math.min(Math.max(normalizedValue, min), max);
    }

    return Math.max(normalizedValue, min);
  };
  const [draftValue, setDraftValue] = useState(() => String(clampValue(value)));

  useEffect(() => {
    setDraftValue(String(clampValue(value)));
  }, [value, min, max]);

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (max !== Infinity && value >= max) {
      if (overMaxWarning) toast.warning(overMaxWarning);
      return;
    }
    onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeOptionalIntegerInputString(e.target.value);
    setDraftValue(sanitizedValue);

    if (sanitizedValue === '') {
      return;
    }

    const parsedValue = parseOptionalIntegerInputValue(sanitizedValue);
    if (parsedValue === '' || parsedValue < min) return;

    if (max !== Infinity && parsedValue > max) {
      if (overMaxWarning) toast.warning(overMaxWarning);
      setDraftValue(String(max));
      onChange(max);
      return;
    }

    if (parsedValue !== value) {
      onChange(parsedValue);
    }
  };

  const handleInputBlur = () => {
    const parsedValue = parseOptionalIntegerInputValue(draftValue);
    if (parsedValue === '' || parsedValue < min) {
      setDraftValue(String(clampValue(value)));
      return;
    }

    const clampedValue = clampValue(parsedValue);
    setDraftValue(String(clampedValue));
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };

  return (
    <div className={`flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 ${s.wrapper} ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`flex items-center justify-center bg-white dark:bg-slate-700 text-body hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${s.button}`}
      >
        <FiMinus />
      </button>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draftValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className={`text-body text-center border-none bg-transparent font-extrabold focus:ring-0 p-0 disabled:opacity-60 ${s.input}`}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== Infinity && value >= max)}
        className={`flex items-center justify-center bg-white dark:bg-slate-700 text-body hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${s.button}`}
      >
        <FiPlus />
      </button>
    </div>
  );
}
