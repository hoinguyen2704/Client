import type { PrimaryButtonProps } from '../ui/types';
import Button from './Button';

export default function PrimaryButton({ 
  children, 
  icon, 
  onClick, 
  href, 
  className = '', 
  type = 'button', 
  disabled = false,
  variant = 'primary',
  isLoading = false
}: PrimaryButtonProps) {
  return (
    <Button
      icon={icon}
      onClick={onClick}
      href={href}
      className={className}
      type={type}
      disabled={disabled}
      variant={variant === 'outline' ? 'outline' : 'primary'}
      loading={isLoading}
    >
      {children}
    </Button>
  );
}
