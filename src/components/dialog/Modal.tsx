import { useEffect, type ReactNode } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import type { ModalProps, ModalCancelButtonProps, ModalSubmitButtonProps } from '../ui/types';
import { MODAL_SIZE_MAP } from '../ui/constants';
import Button from '../button/Button';
import IconButton from '../button/IconButton';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  scrollable = false,
  className = '',
  containerClassName = '',
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${containerClassName}`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${MODAL_SIZE_MAP[size]} border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                <IconButton
                  onClick={onClose}
                  variant="ghost"
                  icon={<FiX className="text-xl" />}
                  className="rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                />
              </div>
            )}

            {/* Body */}
            <div className={`p-6 ${scrollable ? 'overflow-y-auto max-h-[70vh]' : ''}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Pre-styled footer buttons ─────────────────────────── */

export function ModalCancelButton({ onClick, children = 'Hủy' }: ModalCancelButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      className="h-10 px-6 font-medium"
    >
      {children}
    </Button>
  );
}

export function ModalSubmitButton({
  onClick,
  icon,
  children = 'Lưu',
  variant = 'primary',
}: ModalSubmitButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={icon}
      variant={variant === 'danger' ? 'danger' : 'primary'}
      className="h-10 px-6 font-medium"
    >
      {children}
    </Button>
  );
}
