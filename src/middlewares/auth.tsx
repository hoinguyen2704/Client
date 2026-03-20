import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

/**
 * Yêu cầu đăng nhập — redirect /login nếu chưa login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, token } = useAuthStore();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Yêu cầu quyền ADMIN — redirect /403 nếu không phải admin.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, user } = useAuthStore();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
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
