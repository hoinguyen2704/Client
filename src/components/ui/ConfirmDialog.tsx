import { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiTrash2, FiRefreshCw, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ReactNode; btnClass: string; iconBg: string }> = {
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

export default function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cfg = variantConfig[variant];

  // Auto-focus confirm button when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmBtnRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiX className="text-lg" />
            </button>

            {/* Content */}
            <div className="p-6 pt-8 flex flex-col items-center text-center">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center mb-4`}>
                {cfg.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-11 rounded-xl font-medium text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                onClick={onConfirm}
                className={`flex-1 h-11 rounded-xl font-medium text-sm text-white transition-colors focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${cfg.btnClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
