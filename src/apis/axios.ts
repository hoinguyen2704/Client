import axios from 'axios';
import { toast } from 'sonner';
import useAuthStore from '@/stores/useAuthStore';

// Flag chống gọi logout() nhiều lần khi nhiều request cùng nhận 401
let isLoggingOut = false;

// ─── Shared interceptor setup ───────────────────────────────────
function attachAuthInterceptors(instance: ReturnType<typeof axios.create>) {
  // Request: tự gắn Bearer token từ Zustand store
  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response: unwrap data, handle errors
  instance.interceptors.response.use(
    (response) => response.data, // unwrap AxiosResponse → ApiResponse
    (error) => {
      if (error.response?.status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        useAuthStore.getState().logout();
        // Reset flag sau 2s để cho phép logout lại sau khi đã redirect
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
      return Promise.reject(error.response?.data || error);
    },
  );

  return instance;
}

// ─── Client API (api/v1) ────────────────────────────────────────
const clientAxios = attachAuthInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  }),
);

// ─── Admin API (admin/api/v1) ───────────────────────────────────
export const adminAxios = attachAuthInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_ADMIN_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  }),
);

export default clientAxios;
