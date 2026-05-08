import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 'admin' shows info text + border-top, 'storefront' is centered (default) */
  variant?: 'admin' | 'storefront';
  /** Total item count — shown in admin variant */
  totalItems?: number;
  /** Items per page — used to compute "Showing X-Y of Z" in admin variant */
  perPage?: number;
  /** Label for items, e.g. "sản phẩm", "đơn hàng" (admin variant) */
  label?: string;
  className?: string;
}

// Shared button styles
const BTN_BASE =
  'h-10 sm:h-11 flex items-center justify-center rounded-xl text-md font-semibold transition-all duration-200 select-none';
const BTN_ICON =
  'w-10 sm:w-11';
const BTN_PAGE =
  'min-w-10 sm:min-w-11 px-3 sm:px-3.5 tabular-nums';
const BTN_IDLE =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-[1px_1px_3px_rgba(0,0,0,0.04)]';
const BTN_ACTIVE =
  'bg-blue-600 border border-blue-600 text-white shadow-sm shadow-blue-950/15';
const BTN_DISABLED =
  'opacity-40 cursor-not-allowed pointer-events-none';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'storefront',
  totalItems,
  perPage,
  label,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation('common');
  const resolvedLabel = label || t('pagination.items');

  if (totalPages <= 1) return null;

  // Generate visible page numbers with smart ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const isAdmin = variant === 'admin';
  const showInfo = isAdmin && totalItems != null && perPage != null;
  const start = showInfo ? (currentPage - 1) * perPage! + 1 : 0;
  const end = showInfo ? Math.min(currentPage * perPage!, totalItems!) : 0;

  return (
    <div
      className={`flex items-center ${
        isAdmin
          ? 'p-4 border-t border-slate-100 dark:border-slate-800 justify-between'
          : 'justify-center pt-4 sm:pt-6'
      } ${className}`}
    >
      {/* Info text — admin only */}
      {showInfo && (
        <div className="text-md text-muted">
          {t('pagination.showing')}{' '}
          <span className="font-semibold text-body">
            {start}-{end}
          </span>{' '}
          {t('pagination.of')}{' '}
          <span className="font-semibold text-body">
            {totalItems!.toLocaleString()}
          </span>{' '}
          {resolvedLabel}
        </div>
      )}

      {/* Page buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Prev */}
        <button
          className={`${BTN_BASE} ${BTN_ICON} ${currentPage === 1 ? BTN_DISABLED : BTN_IDLE}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label={t('actions.previousPage')}
        >
          <FiChevronLeft className="text-base" />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`dots-${i}`}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-subtle text-md font-bold tracking-widest"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${BTN_BASE} ${BTN_PAGE} ${p === currentPage ? BTN_ACTIVE : BTN_IDLE}`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          className={`${BTN_BASE} ${BTN_ICON} ${currentPage === totalPages ? BTN_DISABLED : BTN_IDLE}`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label={t('actions.nextPage')}
        >
          <FiChevronRight className="text-base" />
        </button>
      </div>
    </div>
  );
}
