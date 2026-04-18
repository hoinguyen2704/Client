/**
 * CMS & Content statuses — bài viết, danh mục, user roles.
 */
export const CMS_STATUS = {
  published: { label: 'Published', labelKey: 'status.cms.published', className: 'bg-green-100 text-green-600' },
  draft:     { label: 'Draft', labelKey: 'status.cms.draft', className: 'bg-orange-100 text-orange-600' },
  hidden:    { label: 'Hidden', labelKey: 'status.cms.hidden', className: 'bg-slate-100 text-slate-600' },
  upcoming:  { label: 'Upcoming', labelKey: 'status.cms.upcoming', className: 'bg-blue-100 text-blue-600' },
  ended:     { label: 'Ended', labelKey: 'status.cms.ended', className: 'bg-slate-100 text-slate-500' },
  approved:  { label: 'Approved', labelKey: 'status.cms.approved', className: 'bg-green-100 text-green-600' },
  spam:      { label: 'Spam', labelKey: 'status.cms.spam', className: 'bg-red-100 text-red-600' },
  admin:     { label: 'Admin', labelKey: 'status.cms.admin', className: 'bg-purple-100 text-purple-600' },
  user:      { label: 'User', labelKey: 'status.cms.user', className: 'bg-slate-100 text-slate-600' },
} as const;
