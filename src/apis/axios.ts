import axios from 'axios';

// ─── Shared interceptor setup ───────────────────────────────────
function attachAuthInterceptors(instance: ReturnType<typeof axios.create>) {
  // Request: tự gắn Bearer token
  instance.interceptors.request.use((config) => {
    const raw = localStorage.getItem('auth');
    if (raw) {
      try {
        const auth = JSON.parse(raw);
        if (auth?.state?.token) {
          config.headers.Authorization = `Bearer ${auth.state.token}`;
        }
      } catch {
        // ignore parse error
      }
    }
    return config;
  });

  // Response: unwrap data, handle errors
  instance.interceptors.response.use(
    (response) => response.data, // unwrap AxiosResponse → ApiResponse
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth');
        window.location.href = '/login';
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
