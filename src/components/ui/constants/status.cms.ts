/**
 * CMS & Content statuses — bài viết, danh mục, user roles.
 */
export const CMS_STATUS = {
  published: { label: 'Đã xuất bản',  className: 'bg-green-100 text-green-600' },
  draft:     { label: 'Bản nháp',     className: 'bg-orange-100 text-orange-600' },
  hidden:    { label: 'Đã ẩn',        className: 'bg-slate-100 text-slate-600' },
  upcoming:  { label: 'Sắp diễn ra',  className: 'bg-blue-100 text-blue-600' },
  ended:     { label: 'Đã kết thúc',  className: 'bg-slate-100 text-slate-500' },
  approved:  { label: 'Đã duyệt',     className: 'bg-green-100 text-green-600' },
  spam:      { label: 'Spam',          className: 'bg-red-100 text-red-600' },
  admin:     { label: 'Admin',         className: 'bg-purple-100 text-purple-600' },
  user:      { label: 'User',          className: 'bg-slate-100 text-slate-600' },
} as const;
