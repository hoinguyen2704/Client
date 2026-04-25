/**
 * Generic statuses — dùng chung cho nhiều nơi (lowercase).
 */
export const GENERIC_STATUS = {
  completed:   { label: 'Delivered', labelKey: 'status.generic.completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  delivered:   { label: 'Delivered', labelKey: 'status.generic.delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  processing:  { label: 'Pending processing', labelKey: 'status.generic.processing', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' },
  shipping:    { label: 'Shipping', labelKey: 'status.generic.shipping', className: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20' },
  cancelled:   { label: 'Cancelled', labelKey: 'status.generic.cancelled', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20' },
  pending:     { label: 'Pending approval', labelKey: 'status.generic.pending', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  verified:    { label: 'Verified', labelKey: 'status.generic.verified', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20' },
  active:      { label: 'Active', labelKey: 'status.generic.active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  inactive:    { label: 'Suspended', labelKey: 'status.generic.inactive', className: 'bg-slate-100 text-body border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
  expired:     { label: 'Expired', labelKey: 'status.generic.expired', className: 'bg-slate-100 text-muted border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
  open:        { label: 'New', labelKey: 'status.generic.open', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' },
  in_progress: { label: 'In progress', labelKey: 'status.generic.inProgress', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  replied:     { label: 'Replied', labelKey: 'status.generic.replied', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  closed:      { label: 'Closed', labelKey: 'status.generic.closed', className: 'bg-slate-100 text-body border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
  vip:         { label: 'VIP', labelKey: 'status.generic.vip', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20' },
  banned:      { label: 'Banned', labelKey: 'status.generic.banned', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' },

  // Backend enums (UPPERCASE)
  ACTIVE:    { label: 'Active', labelKey: 'status.generic.active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  DRAFT:     { label: 'Draft', labelKey: 'status.cms.draft', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  INACTIVE:  { label: 'Hidden', labelKey: 'status.cms.hidden', className: 'bg-slate-100 text-body border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
  UPCOMING:  { label: 'Upcoming', labelKey: 'status.cms.upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' },
  ENDED:     { label: 'Ended', labelKey: 'status.cms.ended', className: 'bg-slate-100 text-muted border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
  EXPIRED:   { label: 'Expired', labelKey: 'status.generic.expired', className: 'bg-slate-100 text-muted border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },

  // Ticket statuses (with rich border & dark mode styling)
  OPEN:        { label: 'Open', labelKey: 'status.ticket.open', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300' },
  IN_PROGRESS: { label: 'In progress', labelKey: 'status.ticket.inProgress', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' },
  ANSWERED:    { label: 'Answered', labelKey: 'status.ticket.answered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' },
  RESOLVED:    { label: 'Resolved', labelKey: 'status.ticket.resolved', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300' },
  CLOSED:      { label: 'Closed', labelKey: 'status.ticket.closed', className: 'bg-slate-100 text-body border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20' },
} as const;
