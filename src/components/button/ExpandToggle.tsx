import { memo } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { ExpandToggleProps } from '@/types';
import Button from './Button';

function ExpandToggle({
  expanded,
  onToggle,
  expandLabel,
  collapseLabel,
  variant = 'outline',
  className = '',
}: ExpandToggleProps) {
  const { t } = useTranslation('common');
  const Icon = expanded ? FiChevronUp : FiChevronDown;
  const label = expanded
    ? (collapseLabel || t('actions.collapse', { defaultValue: 'Thu gọn' }))
    : (expandLabel || t('actions.expand', { defaultValue: 'Xem thêm' }));

  return (
    <Button
      onClick={onToggle}
      variant={variant === 'outline' ? 'outline' : 'ghost'}
      size="sm"
      iconRight={<Icon className="text-base" />}
      className={`!rounded-full ${className}`}
    >
      {label}
    </Button>
  );
}

export default memo(ExpandToggle);
