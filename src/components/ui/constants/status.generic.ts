/**
 * Generic statuses — dùng chung cho nhiều nơi (lowercase).
 */
export const GENERIC_STATUS = {
  completed:   { label: 'Delivered', labelKey: 'status.generic.completed', className: 'bg-emerald-100 text-emerald-600' },
  delivered:   { label: 'Delivered', labelKey: 'status.generic.delivered', className: 'bg-emerald-100 text-emerald-600' },
  processing:  { label: 'Pending processing', labelKey: 'status.generic.processing', className: 'bg-blue-100 text-blue-600' },
  shipping:    { label: 'Shipping', labelKey: 'status.generic.shipping', className: 'bg-violet-100 text-violet-600' },
  cancelled:   { label: 'Cancelled', labelKey: 'status.generic.cancelled', className: 'bg-rose-100 text-rose-600' },
  pending:     { label: 'Pending approval', labelKey: 'status.generic.pending', className: 'bg-amber-100 text-amber-600' },
  verified:    { label: 'Verified', labelKey: 'status.generic.verified', className: 'bg-indigo-100 text-indigo-600' },
  active:      { label: 'Active', labelKey: 'status.generic.active', className: 'bg-green-100 text-green-600' },
  inactive:    { label: 'Suspended', labelKey: 'status.generic.inactive', className: 'bg-slate-100 text-slate-600' },
  expired:     { label: 'Expired', labelKey: 'status.generic.expired', className: 'bg-slate-100 text-slate-500' },
  open:        { label: 'New', labelKey: 'status.generic.open', className: 'bg-red-100 text-red-600' },
  in_progress: { label: 'In progress', labelKey: 'status.generic.inProgress', className: 'bg-orange-100 text-orange-600' },
  replied:     { label: 'Replied', labelKey: 'status.generic.replied', className: 'bg-green-100 text-green-600' },
  closed:      { label: 'Closed', labelKey: 'status.generic.closed', className: 'bg-slate-100 text-slate-600' },
  vip:         { label: 'VIP', labelKey: 'status.generic.vip', className: 'bg-purple-100 text-purple-600' },
  banned:      { label: 'Banned', labelKey: 'status.generic.banned', className: 'bg-red-100 text-red-600' },

  // Backend enums (UPPERCASE)
  ACTIVE:    { label: 'Active', labelKey: 'status.generic.active', className: 'bg-green-100 text-green-600' },
  DRAFT:     { label: 'Draft', labelKey: 'status.cms.draft', className: 'bg-orange-100 text-orange-600' },
  INACTIVE:  { label: 'Hidden', labelKey: 'status.cms.hidden', className: 'bg-slate-100 text-slate-600' },
  UPCOMING:  { label: 'Upcoming', labelKey: 'status.cms.upcoming', className: 'bg-blue-100 text-blue-600' },
  ENDED:     { label: 'Ended', labelKey: 'status.cms.ended', className: 'bg-slate-100 text-slate-500' },
  EXPIRED:   { label: 'Expired', labelKey: 'status.generic.expired', className: 'bg-slate-100 text-slate-500' },

  // Ticket statuses (with rich border & dark mode styling)
  OPEN:        { label: 'Open', labelKey: 'status.ticket.open', className: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  IN_PROGRESS: { label: 'In progress', labelKey: 'status.ticket.inProgress', className: 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' },
  ANSWERED:    { label: 'Answered', labelKey: 'status.ticket.answered', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  RESOLVED:    { label: 'Resolved', labelKey: 'status.ticket.resolved', className: 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' },
  CLOSED:      { label: 'Closed', labelKey: 'status.ticket.closed', className: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' },
} as const;
