import { cn } from '@/utils/cn';
import type { CardProps } from './types';

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
