import { FiSearch, FiFilter } from 'react-icons/fi';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminSearchProps } from './types';

export default function AdminSearch({
  placeholder,
  value,
  onChange,
  filters,
  boxed = true,
  autoFocus = false,
  clearable = false,
  onClear,
  inputClassName = '',
}: AdminSearchProps) {
  const { t } = useTranslation('common');
  const resolvedPlaceholder = placeholder || t('actions.search');
  const clearButtonClass =
    'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm transition-colors';
  const containerClass = boxed
    ? "bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4"
    : "flex flex-col md:flex-row gap-4";

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }
    onChange('');
  };

  return (
    <div className={containerClass}>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          className={`w-full h-12 pl-12 ${clearable && value ? 'pr-16' : 'pr-4'} rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`.trim()}
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className={clearButtonClass}
          >
            {t('actions.clear')}
          </button>
        )}
      </div>
      {filters && <div className="flex gap-2">{filters}</div>}
    </div>
  );
}

/** Pre-styled filter button */
export function FilterButton({ onClick, children }: { onClick?: () => void; children?: ReactNode }) {
  const { t } = useTranslation('common');
  return (
    <button
      onClick={onClick}
      className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-body-soft hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium"
    >
      <FiFilter />
      {children || t('actions.filter')}
    </button>
  );
}
