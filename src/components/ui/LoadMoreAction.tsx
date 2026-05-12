import { FiChevronDown } from 'react-icons/fi';
import { cn } from '@/utils/cn';

interface LoadMoreActionProps {
  onClick: () => void | Promise<void>;
  loading: boolean;
  failed: boolean;
  loadLabel: string;
  loadingLabel: string;
  retryLabel: string;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export default function LoadMoreAction({
  onClick,
  loading,
  failed,
  loadLabel,
  loadingLabel,
  retryLabel,
  errorMessage,
  disabled = false,
  className,
  buttonClassName,
}: LoadMoreActionProps) {
  const label = loading ? loadingLabel : failed ? retryLabel : loadLabel;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => {
          void onClick();
        }}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-muted shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-900/40 dark:hover:text-blue-300',
          buttonClassName,
        )}
      >
        <span>{label}</span>
        <FiChevronDown className={cn('shrink-0', loading && 'animate-bounce')} />
      </button>

      {failed && errorMessage ? (
        <p className="text-sm font-medium text-red-500" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
