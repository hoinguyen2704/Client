import { ReactNode } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface TrashButtonProps {
  onClick?: () => void;
  className?: string;
  title?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
}

export default function TrashButton({ onClick, className = '', title = 'Xóa', children, iconOnly = true, disabled = false }: TrashButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-50 disabled:pointer-events-none ${
        iconOnly ? 'w-9 h-9 shrink-0' : 'px-3 py-1.5 text-xs font-semibold'
      } ${className}`}
    >
      <FiTrash2 className={iconOnly ? "text-[1.7rem]" : "text-sm"} />
      {children && <span>{children}</span>}
    </button>
  );
}
