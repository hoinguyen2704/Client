import { Link } from 'react-router-dom';
import type { PrimaryButtonProps } from './types';

export default function PrimaryButton({ children, icon, onClick, href, className = '', type = 'button', disabled = false }: PrimaryButtonProps) {
  const baseClass = `h-11 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm ${className}`;

  if (href) {
    return (
      <Link to={href} className={baseClass}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClass}>
      {icon}
      {children}
    </button>
  );
}
