import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export const ADMIN_TABLE_SURFACE_CLASS =
  'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900';

export const ADMIN_TABLE_CLASS = 'w-full border-collapse text-left';

export const ADMIN_TABLE_HEAD_ROW_CLASS =
  'border-b border-slate-200 bg-slate-50/90 text-body dark:border-slate-700 dark:bg-slate-800/60 [&>th+th]:border-l [&>th+th]:border-slate-200 dark:[&>th+th]:border-slate-700';

export const ADMIN_TABLE_BODY_ROW_CLASS =
  'border-b border-slate-200 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/30 [&>td+td]:border-l [&>td+td]:border-slate-200 dark:[&>td+td]:border-slate-700';

export const ADMIN_TABLE_HEAD_CELL_CLASS = 'p-3 align-middle font-medium sm:p-4';

export const ADMIN_TABLE_CELL_CLASS = 'p-3 align-middle sm:p-4';

export const ADMIN_TABLE_EMPTY_CELL_CLASS = 'p-10 text-center text-subtle sm:p-12';

export const ADMIN_GRID_TABLE_HEADER_BASE_CLASS =
  'hidden gap-0 rounded-t-2xl border-b border-slate-200 bg-slate-50/90 text-center text-body text-md font-semibold dark:border-slate-700 dark:bg-slate-800/60 lg:grid lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-700';

export const ADMIN_GRID_TABLE_ROW_BASE_CLASS =
  'group relative flex flex-col border-b border-slate-200 transition-all duration-300 last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/30 lg:grid lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-700';

export const ADMIN_GRID_TABLE_SKELETON_ROW_BASE_CLASS =
  'flex flex-col items-center border-b border-slate-200 animate-pulse last:border-b-0 dark:border-slate-700 lg:grid lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-700';

export function AdminTableCard({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn(ADMIN_TABLE_SURFACE_CLASS, className)} {...props}>
      {children}
    </div>
  );
}

export function AdminTableScroll({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('overflow-x-auto', className)} {...props}>
      {children}
    </div>
  );
}

export function AdminTable({
  className,
  ...props
}: ComponentPropsWithoutRef<'table'>) {
  return <table className={cn(ADMIN_TABLE_CLASS, className)} {...props} />;
}

export function AdminTableHeadRow({
  className,
  ...props
}: ComponentPropsWithoutRef<'tr'>) {
  return <tr className={cn(ADMIN_TABLE_HEAD_ROW_CLASS, className)} {...props} />;
}

export function AdminTableBodyRow({
  className,
  ...props
}: ComponentPropsWithoutRef<'tr'>) {
  return <tr className={cn(ADMIN_TABLE_BODY_ROW_CLASS, className)} {...props} />;
}

export function AdminTableHeadCell({
  className,
  ...props
}: ComponentPropsWithoutRef<'th'>) {
  return <th className={cn(ADMIN_TABLE_HEAD_CELL_CLASS, className)} {...props} />;
}

export function AdminTableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<'td'>) {
  return <td className={cn(ADMIN_TABLE_CELL_CLASS, className)} {...props} />;
}

interface AdminTableEmptyRowProps {
  children: ReactNode;
  className?: string;
  colSpan: number;
}

export function AdminTableEmptyRow({
  children,
  className,
  colSpan,
}: AdminTableEmptyRowProps) {
  return (
    <tr>
      <td className={cn(ADMIN_TABLE_EMPTY_CELL_CLASS, className)} colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}
