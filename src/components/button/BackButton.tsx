import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import type { BackButtonProps } from '../ui/types';
export default function BackButton({ to, state, label, className = '' }: BackButtonProps) {
  if (label) {
    return (
      <Link
        to={to}
        state={state}
        className={`inline-flex items-center gap-2 text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${className}`}>
        <FiArrowLeft />
        {label}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      state={state}
      className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors inline-flex items-center justify-center ${className}`}>
      <FiArrowLeft className="text-xl" />
    </Link>
  );
}
