import { memo } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { ExpandToggleProps } from '@/types';
import Button from './Button';

function ExpandToggle({
  expanded,
  onToggle,
  expandLabel = 'Xem thêm',
  collapseLabel = 'Thu gọn',
  variant = 'outline',
  className = '',
}: ExpandToggleProps) {
  const Icon = expanded ? FiChevronUp : FiChevronDown;
  const label = expanded ? collapseLabel : expandLabel;

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

