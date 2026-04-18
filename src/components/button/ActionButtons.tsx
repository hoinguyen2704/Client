import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ActionButtonsProps } from '../ui/types';
import { ACTION_STYLES, ACTION_ICONS, ACTION_TITLES } from '../ui/constants';

export default function ActionButtons({ actions }: ActionButtonsProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center justify-center gap-2 text-[1.4rem]">
      {actions
        .filter((a) => !a.hidden)
        .map((action, i) => {
          const cls = `p-2 rounded-lg transition-colors ${ACTION_STYLES[action.type]}`;
          const icon = action.icon || ACTION_ICONS[action.type];
          const title = action.title || t(action.titleKey || ACTION_TITLES[action.type], {
            defaultValue: action.titleKey || ACTION_TITLES[action.type],
          });

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
