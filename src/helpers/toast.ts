/**
 * Lightweight toast helpers (console-based fallback).
 * Replace with react-hot-toast or sonner when ready.
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

const toast = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
  warning: (message: string) => showToast('warning', message),
  info: (message: string) => showToast('info', message),
};

function showToast(type: ToastType, message: string) {
  // TODO: integrate a real toast library (react-hot-toast / sonner)
  console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](
    `[${type.toUpperCase()}] ${message}`,
  );
}

export default toast;
