import { useEffect, useRef } from 'react';
import { FiTrash2, FiDownload } from 'react-icons/fi';
import Modal from '../dialog/Modal';
import Button from '../button/Button';
import type { ConfirmDialogProps } from '../ui/types';
import { CONFIRM_VARIANT_CONFIG } from '../ui/constants';

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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1 h-11"
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmBtnRef}
            onClick={onConfirm}
            icon={
              !cfg.icon ? null :
              confirmLabel.toLowerCase().includes('xóa') ? <FiTrash2 /> :
              confirmLabel.toLowerCase().includes('xuất') || confirmLabel.toLowerCase().includes('tải') ? <FiDownload /> :
              null
            }
            className={`flex-1 h-11 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${cfg.btnClass}`}
          >
            {confirmLabel}
          </Button>
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
