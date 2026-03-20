import { FiSearch, FiFilter } from 'react-icons/fi';
import { type ReactNode } from 'react';

interface AdminSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** Extra filter elements (selects, buttons) rendered on the right */
  filters?: ReactNode;
}

export default function AdminSearch({
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  filters,
}: AdminSearchProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
      </div>
      {filters && <div className="flex gap-2">{filters}</div>}
    </div>
  );
}

/** Pre-styled filter button */
export function FilterButton({ onClick, children }: { onClick?: () => void; children?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium"
    >
      <FiFilter />
      {children || 'Lọc'}
    </button>
  );
}
