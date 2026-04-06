import axios from "axios";
import { toast } from "sonner";
import useAuthStore from "@/stores/useAuthStore";

let isLoggingOut = false;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

//  Shared interceptor setup
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
    async (error) => {
      const originalRequest =
        error.config as import("axios").InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

      // Chặn 401 và cả 403 (trong Spring Boot, ExpiredJwtException bị đẩy ra ngoài context có thể sẽ trả về 403)
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        originalRequest
      ) {
        if (originalRequest._retry) {
          if (!isLoggingOut) {
            isLoggingOut = true;
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            useAuthStore.getState().logout();
            setTimeout(() => {
              isLoggingOut = false;
            }, 2000);
          }
          return Promise.reject(error.response?.data || error);
        }

        originalRequest._retry = true;
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          if (!isLoggingOut) {
            isLoggingOut = true;
            useAuthStore.getState().logout();
            setTimeout(() => {
              isLoggingOut = false;
            }, 2000);
          }
          return Promise.reject(error.response?.data || error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Dùng axios cơ bản gửi mới API refresh-token tránh bị dính interceptor lặp
            const refreshRes = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`,
              { refreshToken },
            );

            // refreshRes.data từ axios default vẫn bọc trong { data: ... } của Axios
            // Dữ liệu API của ta: { message: "...", data: { accessToken, refreshToken, user } }
            const apiRes = refreshRes.data.data;
            const newAccessToken = apiRes.accessToken;
            const newRefreshToken = apiRes.refreshToken;

            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
            onRefreshed(newAccessToken);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          } catch (refreshErr) {
            isRefreshing = false;
            refreshSubscribers = [];
            if (!isLoggingOut) {
              isLoggingOut = true;
              toast.error(
                "Gia hạn đăng nhập thất bại. Vui lòng đăng nhập lại.",
              );
              useAuthStore.getState().logout();
              setTimeout(() => {
                isLoggingOut = false;
              }, 2000);
            }
            return Promise.reject(refreshErr);
          }
        }

        // Đang refresh thì cho vào danh sách chờ
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      return Promise.reject(error.response?.data || error);
    },
  );

  return instance;
}

//  Client API (api/v1)
const clientAxios = attachAuthInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  }),
);

//  Admin API (admin/api/v1)
export const adminAxios = attachAuthInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_ADMIN_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  }),
);

export default clientAxios;
