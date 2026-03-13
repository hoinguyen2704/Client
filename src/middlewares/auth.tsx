import { Navigate, useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '@/helpers/constant';

interface AuthState {
  state?: {
    token?: string;
    user?: { role?: string };
  };
}

function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Yêu cầu đăng nhập — redirect /login nếu chưa login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const auth = getAuth();

  if (!auth?.state?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Yêu cầu quyền ADMIN — redirect /403 nếu không phải admin.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const auth = getAuth();

  if (!auth?.state?.token) {
    return <Navigate to="/login" replace />;
  }

  if (auth.state.user?.role !== 'ADMIN') {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

/**
 * Check JWT hết hạn (dùng decode payload).
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}
