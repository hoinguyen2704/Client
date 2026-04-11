import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import type {
  ModalProps,
  ModalCancelButtonProps,
  ModalSubmitButtonProps,
} from "../ui/types";
import { MODAL_SIZE_MAP } from "../ui/constants";
import Button from "../button/Button";
import IconButton from "../button/IconButton";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  scrollable = false,
  className = "",
  containerClassName = "",
}: ModalProps) {
  // Stable ref for onClose — avoids re-attaching listener when parent re-renders
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-[999] flex items-start justify-center px-3 sm:px-4 pt-10 sm:pt-10 pb-3 sm:pb-4 ${containerClassName}`}
        >
          {/* Backdrop (Removed backdrop-blur-sm for extreme performance boost) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${MODAL_SIZE_MAP[size]} max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-6rem)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col ${className}`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <IconButton
                  onClick={onClose}
                  variant="ghost"
                  icon={<FiX className="text-lg sm:text-xl" />}
                  className="rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                />
              </div>
            )}

            {/* Body */}
            <div
              className={`p-4 sm:p-6 ${scrollable ? "flex-1 min-h-0 overflow-y-auto" : ""}`}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/*  Pre-styled footer buttons  */

export function ModalCancelButton({
  onClick,
  children = "Hủy",
}: ModalCancelButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      className="h-10 px-6 font-medium w-full sm:w-auto"
    >
      {children}
    </Button>
  );
}

export function ModalSubmitButton({
  onClick,
  icon,
  children = "Lưu",
  variant = "primary",
}: ModalSubmitButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={icon}
      variant={variant === "danger" ? "danger" : "primary"}
      className="h-10 px-6 font-medium w-full sm:w-auto"
    >
      {children}
    </Button>
  );
}
