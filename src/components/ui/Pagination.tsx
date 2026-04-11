import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * A centered, user-facing pagination component with prev/next arrows
 * and smart ellipsis for large page counts.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate visible page numbers with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={`flex justify-center items-center gap-1.5 sm:gap-2 pt-3 sm:pt-4 ${className}`}>
      <button
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
      >
        <FiChevronLeft />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`dots-${i}`}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang sau"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
