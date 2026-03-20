import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';

// ─── Button configs ─────────────────────────────────────────────
type ActionType = 'edit' | 'delete' | 'view' | 'more';

interface ActionConfig {
  type: ActionType;
  /** Link href — makes this a Link instead of button */
  href?: string;
  /** Custom title tooltip */
  title?: string;
  /** Custom icon override */
  icon?: ReactNode;
  /** Click handler for buttons */
  onClick?: () => void;
  /** Hide this button */
  hidden?: boolean;
}

const STYLES: Record<ActionType, string> = {
  edit: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400',
  delete: 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400',
  view: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400',
  more: 'text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300',
};

const ICONS: Record<ActionType, ReactNode> = {
  edit: <FiEdit2 />,
  delete: <FiTrash2 />,
  view: <FiEye />,
  more: <FiMoreVertical />,
};

const TITLES: Record<ActionType, string> = {
  edit: 'Chỉnh sửa',
  delete: 'Xóa',
  view: 'Xem chi tiết',
  more: 'Thêm',
};

interface ActionButtonsProps {
  actions: ActionConfig[];
}

export default function ActionButtons({ actions }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {actions
        .filter((a) => !a.hidden)
        .map((action, i) => {
          const cls = `p-2 rounded-lg transition-colors ${STYLES[action.type]}`;
          const icon = action.icon || ICONS[action.type];
          const title = action.title || TITLES[action.type];

          if (action.href) {
            return (
              <Link key={i} to={action.href} className={cls} title={title}>
                {icon}
              </Link>
            );
          }

          return (
            <button key={i} className={cls} title={title} onClick={action.onClick}>
              {icon}
            </button>
          );
        })}
    </div>
  );
}
