import { ReactNode } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface TrashButtonProps {
  onClick?: () => void;
  className?: string;
  title?: string;
  children?: ReactNode;
  iconOnly?: boolean;
}

export default function TrashButton({ onClick, className = '', title = 'Xóa', children, iconOnly = true }: TrashButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 transition-colors ${
        iconOnly ? 'w-9 h-9 shrink-0' : 'px-3 py-1.5 text-xs font-semibold'
      } ${className}`}
    >
      <FiTrash2 className={iconOnly ? "text-[1.1rem]" : "text-sm"} />
      {children && <span>{children}</span>}
    </button>
  );
}
