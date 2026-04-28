import { useEffect, useRef } from 'react';
import { FiTrash2, FiDownload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/dialog/Modal';
import Button from '@/components/button/Button';
import type { ConfirmDialogProps } from '@/components/ui/types';
import { CONFIRM_VARIANT_CONFIG } from '@/components/ui/constants';

function parseKeywords(value: string) {
  return value
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
}

function resolveConfirmIcon(
  label: string,
  deleteKeywords: string[],
  downloadKeywords: string[],
) {
  const normalized = label.toLowerCase();
  if (deleteKeywords.some((keyword) => normalized.includes(keyword))) {
    return <FiTrash2 />;
  }
  if (downloadKeywords.some((keyword) => normalized.includes(keyword))) {
    return <FiDownload />;
  }
  return null;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation('common');
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cfg = CONFIRM_VARIANT_CONFIG[variant];
  const resolvedTitle = title || t('confirmDialog.title');
  const resolvedConfirmLabel = confirmLabel || t('confirmDialog.confirm');
  const resolvedCancelLabel = cancelLabel || t('confirmDialog.cancel');
  const deleteKeywords = parseKeywords(t('confirmDialog.iconKeywords.delete'));
  const downloadKeywords = parseKeywords(t('confirmDialog.iconKeywords.download'));

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
            {resolvedCancelLabel}
          </Button>
          <Button
            ref={confirmBtnRef}
            onClick={onConfirm}
            icon={
              !cfg.icon
                ? null
                : resolveConfirmIcon(
                    resolvedConfirmLabel,
                    deleteKeywords,
                    downloadKeywords,
                  )
            }
            className={`flex-1 h-11 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${cfg.btnClass}`}
          >
            {resolvedConfirmLabel}
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
        <h3 className="text-lg font-bold text-ink mb-2">
          {resolvedTitle}
        </h3>

        {/* Message */}
        <p className="max-w-xs whitespace-pre-line text-md leading-relaxed text-muted">
          {message}
        </p>
      </div>
    </Modal>
  );
}
