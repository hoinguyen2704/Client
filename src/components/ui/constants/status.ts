import type { StatusType } from '../types';
import { GENERIC_STATUS } from './status.generic';
import { CMS_STATUS } from './status.cms';
import { ORDER_STATUS } from './status.order';
import { PAYMENT_STATUS } from './status.payment';
import { STOCK_STATUS } from './status.stock';

/**
 * Merged STATUS_CONFIG — gộp tất cả domain status vào 1 map duy nhất
 * để StatusBadge component tra cứu.
 */
export const STATUS_CONFIG: Record<StatusType, { label: string; labelKey?: string; className: string }> = {
  ...GENERIC_STATUS,
  ...CMS_STATUS,
  ...ORDER_STATUS,
  ...PAYMENT_STATUS,
  ...STOCK_STATUS,
};
