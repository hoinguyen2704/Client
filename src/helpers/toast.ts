import { toast as sonnerToast } from 'sonner';

/**
 * Toast helpers — powered by sonner.
 */
const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  warning: (message: string) => sonnerToast.warning(message),
  info: (message: string) => sonnerToast.info(message),
  loading: (message: string) => sonnerToast.loading(message),
  promise: sonnerToast.promise,
};

export default toast;
