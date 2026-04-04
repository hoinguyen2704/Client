import { Link } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import type { PrimaryButtonProps } from '../ui/types';

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
  const isPrimary = variant === 'primary';
  const baseClass = `h-11 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none text-sm 
  ${isPrimary ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0' : 'border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent'} 
  ${className}`;

  if (href && !isLoading) {
    return (
      <Link to={href} className={baseClass}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} className={baseClass}>
      {isLoading ? <FiLoader className="animate-spin text-lg" /> : icon}
      {children}
    </button>
  );
}
