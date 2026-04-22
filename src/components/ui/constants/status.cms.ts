/**
 * CMS & Content statuses — bài viết, danh mục, user roles.
 */
export const CMS_STATUS = {
  published: { label: 'Published', labelKey: 'status.cms.published', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  draft:     { label: 'Draft', labelKey: 'status.cms.draft', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  hidden:    { label: 'Hidden', labelKey: 'status.cms.hidden', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20' },
  upcoming:  { label: 'Upcoming', labelKey: 'status.cms.upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' },
  ended:     { label: 'Ended', labelKey: 'status.cms.ended', className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20' },
  approved:  { label: 'Approved', labelKey: 'status.cms.approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  spam:      { label: 'Spam', labelKey: 'status.cms.spam', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' },
  admin:     { label: 'Admin', labelKey: 'status.cms.admin', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20' },
  user:      { label: 'User', labelKey: 'status.cms.user', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20' },
} as const;
