import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import type { BackButtonProps } from './types';
export default function BackButton({ to, label, className = '' }: BackButtonProps) {
  if (label) {
    return (
      <Link
        to={to}
        className={`inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium ${className}`}>
        <FiArrowLeft />
        {label}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors inline-flex items-center justify-center ${className}`}>
      <FiArrowLeft className="text-xl" />
    </Link>
  );
}
