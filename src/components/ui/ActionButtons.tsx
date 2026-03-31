import { Link } from 'react-router-dom';
import type { ActionButtonsProps } from './types';
import { ACTION_STYLES, ACTION_ICONS, ACTION_TITLES } from './constants';

export default function ActionButtons({ actions }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {actions
        .filter((a) => !a.hidden)
        .map((action, i) => {
          const cls = `p-2 rounded-lg transition-colors ${ACTION_STYLES[action.type]}`;
          const icon = action.icon || ACTION_ICONS[action.type];
          const title = action.title || ACTION_TITLES[action.type];

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
