import { FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

// ─── ADMIN ORDER CONSTANTS ──────────────────────────────────────
export const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xử lý', colorClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' },
  { value: 'PROCESSING', label: 'Đang xử lý', colorClass: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  { value: 'SHIPPING', label: 'Đang giao', colorClass: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400' },
  { value: 'SHIPPED', label: 'Đã giao', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
  { value: 'CANCELLED', label: 'Đã hủy', colorClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' }
];

export const ORDER_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...ORDER_STATUS_OPTIONS
];

// ─── CLIENT ACCOUNT ORDER CONSTANTS ─────────────────────────────
export const CLIENT_ORDER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
  { id: 'PROCESSING', label: 'Người gửi đang chuẩn bị hàng' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'SHIPPED', label: 'Đã giao' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export const ORDER_TRACKING_STEPS = [
  { key: 'PENDING', label: 'Chờ xác nhận', icon: FiPackage },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: FiCheckCircle },
  { key: 'PROCESSING', label: 'Người gửi đang chuẩn bị hàng', icon: FiPackage },
  { key: 'SHIPPING', label: 'Đang giao', icon: FiTruck },
  { key: 'SHIPPED', label: 'Đã giao', icon: FiCheckCircle },
];

export const ORDER_STATUS_INDEX: Record<string, number> = { 
  PENDING: 0, 
  CONFIRMED: 1,
  PROCESSING: 2, 
  SHIPPING: 3, 
  SHIPPED: 4,
};

// Define status badge render helper for client UI
export const getClientStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 text-xs font-bold uppercase tracking-wider"><FiPackage /> Chờ xác nhận</span>;
    case 'CONFIRMED': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider"><FiCheckCircle /> Đã xác nhận</span>;
    case 'PROCESSING': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 text-xs font-bold uppercase tracking-wider"><FiPackage /> Người gửi đang chuẩn bị hàng</span>;
    case 'SHIPPING': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400 text-xs font-bold uppercase tracking-wider"><FiTruck /> Đang giao</span>;
    case 'SHIPPED': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider"><FiCheckCircle /> Đã giao</span>;
    case 'CANCELLED': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 text-xs font-bold uppercase tracking-wider"><FiXCircle /> Đã hủy</span>;
    case 'RETURNED': return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400 text-xs font-bold uppercase tracking-wider"><FiXCircle /> Đã hoàn</span>;
    default: return <span className="flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">{status}</span>;
  }
};
