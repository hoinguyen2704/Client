import type { ReactNode } from 'react';
import { FiAlertTriangle, FiTrash2, FiRefreshCw, FiEdit2, FiMoreVertical, FiEye } from 'react-icons/fi';
import type {
  ConfirmVariant,
  ModalSize,
  StatusType,
  ActionType,
  StarSize,
} from './types';

// ─── Modal size → Tailwind class map ─────────────────────────────
export const MODAL_SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

// ─── StarRating labels & size classes ────────────────────────────
export const STAR_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Kém',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
};

export const STAR_SIZE_CLASS: Record<StarSize, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

// ─── ConfirmDialog variant config ────────────────────────────────
export const CONFIRM_VARIANT_CONFIG: Record<
  ConfirmVariant,
  { icon: ReactNode; btnClass: string; iconBg: string }
> = {
  danger: {
    icon: <FiTrash2 className="text-xl" />,
    btnClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  warning: {
    icon: <FiRefreshCw className="text-xl" />,
    btnClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: <FiAlertTriangle className="text-xl" />,
    btnClass: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
};

// ─── StatusBadge config ──────────────────────────────────────────
export const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  completed:   { label: 'Đã giao',     className: 'bg-emerald-100 text-emerald-600' },
  delivered:   { label: 'Đã giao',     className: 'bg-emerald-100 text-emerald-600' },
  processing:  { label: 'Chờ xử lý',   className: 'bg-blue-100 text-blue-600' },
  shipping:    { label: 'Đang giao',    className: 'bg-violet-100 text-violet-600' },
  cancelled:   { label: 'Đã hủy',      className: 'bg-rose-100 text-rose-600' },
  pending:     { label: 'Chờ duyệt',   className: 'bg-amber-100 text-amber-600' },
  verified:    { label: 'Đã xác nhận', className: 'bg-indigo-100 text-indigo-600' },
  active:      { label: 'Hoạt động',   className: 'bg-green-100 text-green-600' },
  inactive:    { label: 'Tạm khóa',    className: 'bg-slate-100 text-slate-600' },
  expired:     { label: 'Hết hạn',     className: 'bg-slate-100 text-slate-500' },
  open:        { label: 'Mới',         className: 'bg-red-100 text-red-600' },
  in_progress: { label: 'Đang xử lý', className: 'bg-orange-100 text-orange-600' },
  replied:     { label: 'Đã trả lời',  className: 'bg-green-100 text-green-600' },
  closed:      { label: 'Đóng',        className: 'bg-slate-100 text-slate-600' },
  vip:         { label: 'VIP',         className: 'bg-purple-100 text-purple-600' },
  banned:      { label: 'Bị khóa',    className: 'bg-red-100 text-red-600' },

  // Generic reusable statuses
  published:   { label: 'Đã xuất bản',  className: 'bg-green-100 text-green-600' },
  draft:       { label: 'Bản nháp',     className: 'bg-orange-100 text-orange-600' },
  hidden:      { label: 'Đã ẩn',        className: 'bg-slate-100 text-slate-600' },
  upcoming:    { label: 'Sắp diễn ra',  className: 'bg-blue-100 text-blue-600' },
  ended:       { label: 'Đã kết thúc',  className: 'bg-slate-100 text-slate-500' },
  approved:    { label: 'Đã duyệt',     className: 'bg-green-100 text-green-600' },
  spam:        { label: 'Spam',          className: 'bg-red-100 text-red-600' },
  admin:       { label: 'Admin',         className: 'bg-purple-100 text-purple-600' },
  user:        { label: 'User',          className: 'bg-slate-100 text-slate-600' },

  // Uppercase variants (for enums from backend)
  ACTIVE:    { label: 'Hoạt động',     className: 'bg-green-100 text-green-600' },
  INACTIVE:  { label: 'Đã ẩn',        className: 'bg-slate-100 text-slate-600' },
  UPCOMING:  { label: 'Sắp diễn ra',  className: 'bg-blue-100 text-blue-600' },
  ENDED:     { label: 'Đã kết thúc',  className: 'bg-slate-100 text-slate-500' },
  EXPIRED:   { label: 'Hết hạn',      className: 'bg-slate-100 text-slate-500' },

  // Order Statuses (Premium Redesign)
  PENDING:   { label: 'Chờ xử lý',   className: 'bg-amber-50 uppercase tracking-wider text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-indigo-50 uppercase tracking-wider text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' },
  PROCESSING:{ label: 'Đang xử lý',  className: 'bg-blue-50 uppercase tracking-wider text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  SHIPPING:  { label: 'Đang giao',   className: 'bg-violet-50 uppercase tracking-wider text-violet-600 border border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400' },
  SHIPPED:   { label: 'Đã giao',     className: 'bg-emerald-50 uppercase tracking-wider text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  CANCELLED: { label: 'Đã hủy',      className: 'bg-rose-50 uppercase tracking-wider text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' },
  RETURNED:  { label: 'Đã hoàn',     className: 'bg-slate-50 uppercase tracking-wider text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400' },
};

// ─── ActionButtons config ────────────────────────────────────────
export const ACTION_STYLES: Record<ActionType, string> = {
  edit: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400',
  delete: 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400',
  view: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400',
  more: 'text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300',
};

export const ACTION_ICONS: Record<ActionType, ReactNode> = {
  edit: <FiEdit2 />,
  delete: <FiTrash2 />,
  view: <FiEye />,
  more: <FiMoreVertical />,
};

export const ACTION_TITLES: Record<ActionType, string> = {
  edit: 'Chỉnh sửa',
  delete: 'Xóa',
  view: 'Xem chi tiết',
  more: 'Thêm',
};
