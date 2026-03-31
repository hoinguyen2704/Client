import { useEffect, useRef } from 'react';
import Modal from './Modal';
import type { ConfirmDialogProps } from './types';
import { CONFIRM_VARIANT_CONFIG } from './constants';

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
  const cfg = CONFIRM_VARIANT_CONFIG[variant];

  // Auto-focus confirm button when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmBtnRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      containerClassName="z-[9999]"
      footer={
        <div className="flex gap-3 w-full">
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
      }
    >
      <div className="flex flex-col items-center text-center -mt-2">
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
    </Modal>
  );
}
