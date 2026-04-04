import React, { forwardRef } from 'react';
import Button from './Button';
import { cn } from '@/utils/cn';
import type { IconButtonProps, IconButtonSize, IconButtonVariant } from '../ui/types';

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-11 h-11 text-lg',
};

const VARIANT_MAP: Record<IconButtonVariant, 'secondary' | 'primary' | 'danger' | 'ghost'> = {
  neutral: 'secondary',
  primary: 'primary',
  danger: 'danger',
  ghost: 'ghost',
};

export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(({
  icon,
  onClick,
  href,
  className = '',
  title,
  ariaLabel,
  disabled = false,
  variant = 'neutral',
  size = 'md',
  loading = false,
}, ref) => {
  return (
    <Button
      icon={icon}
      onClick={onClick}
      href={href}
      className={cn(SIZE_CLASS[size], 'shrink-0 px-0', className)}
      title={title}
      type="button"
      disabled={disabled}
      variant={VARIANT_MAP[variant]}
      size="sm"
      loading={loading}
      ariaLabel={ariaLabel || title}
      ref={ref}
    />
  );
});

export default IconButton;
