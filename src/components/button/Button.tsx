import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { cn } from '@/utils/cn';
import type { ButtonProps, ButtonSize, ButtonVariant } from '../ui/types';

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-slate-100 dark:bg-slate-800 text-body hover:bg-slate-200 dark:hover:bg-slate-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost:
    'bg-transparent text-body-soft hover:bg-slate-100 dark:hover:bg-slate-800',
  outline:
    'border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(({
  children,
  icon,
  iconRight,
  onClick,
  href,
  form,
  className = '',
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  title,
  ariaLabel,
}, ref) => {
  const classNames = cn(
    BASE_CLASS,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth && 'w-full',
    className,
  );

  const leftIcon = loading ? <FiLoader className="animate-spin text-lg" /> : icon;

  if (href && !loading && !disabled) {
    return (
      <Link to={href} className={classNames} title={title} aria-label={ariaLabel} onClick={onClick} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
        {leftIcon}
        {children}
        {iconRight}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames}
      title={title}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
    >
      {leftIcon}
      {children}
      {iconRight}
    </button>
  );
});

export default Button;
