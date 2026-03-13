import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request: tự gắn Bearer token ──────────────────────────────
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

// ─── Response: unwrap data, handle errors ───────────────────────
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

export default instance;
