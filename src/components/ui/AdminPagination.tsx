import type { AdminPaginationProps } from './types';

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  label = 'mục',
  onPageChange,
}: AdminPaginationProps) {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  // Generate visible page numbers
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
    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
      <div>
        Hiển thị {start}-{end} của {totalItems.toLocaleString()} {label}
      </div>
      <div className="flex gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lt;
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium ${
                p === currentPage
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
