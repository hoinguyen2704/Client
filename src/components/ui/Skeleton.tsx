interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

function SkeletonItem({ className = '', variant = 'text', width, height }: Omit<SkeletonProps, 'count'>) {
  const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-800';
  const variantClass =
    variant === 'circular' ? 'rounded-full' :
    variant === 'rectangular' ? 'rounded-xl' :
    'rounded-md';

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height: height || (variant === 'text' ? '1rem' : undefined) }}
    />
  );
}

export default function Skeleton({ count = 1, ...props }: SkeletonProps) {
  if (count === 1) return <SkeletonItem {...props} />;
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} {...props} />
      ))}
    </div>
  );
}

/** Full-page loading spinner for Suspense fallback */
export function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}

/** Table skeleton for admin pages */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton variant="rectangular" height={44} className="w-full max-w-sm" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4"><Skeleton width="60%" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-slate-100 dark:border-slate-800/50">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="p-4"><Skeleton width={c === 0 ? '80%' : '60%'} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
