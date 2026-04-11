import { FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
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
    const raw = e.target.value;
    if (raw === '') {
      onChange(min);
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < min) return;
    if (max !== Infinity && num > max) {
      if (overMaxWarning) toast.warning(overMaxWarning);
      onChange(max);
    } else {
      onChange(num);
    }
  };

  return (
    <div className={`flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 ${s.wrapper} ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${s.button}`}
      >
        <FiMinus />
      </button>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={`text-center border-none bg-transparent font-bold focus:ring-0 p-0 disabled:opacity-60 ${s.input}`}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== Infinity && value >= max)}
        className={`flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${s.button}`}
      >
        <FiPlus />
      </button>
    </div>
  );
}
