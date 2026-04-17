import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import { authService } from '@/apis';
import useAuthStore from '@/stores/useAuthStore';
import { getApiErrorCode, getApiErrorMessage } from '@/utils/error';

function resolveGoogleRedirectError(code?: string | null, message?: string | null): string {
  if (code === 'SOCIAL_NOT_LINKED') {
    return 'Tài khoản Google chưa liên kết. Hãy đăng nhập bằng mật khẩu rồi liên kết trong Cài đặt tài khoản.';
  }
  return message?.trim() || 'Đăng nhập Google thất bại.';
}

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');

  useEffect(() => {
    const ticket = searchParams.get('ticket');
    if (!ticket) {
      navigate('/login?google_error_code=GOOGLE_TICKET_MISSING&google_error_message=Khong%20nhan%20duoc%20ve%20dang%20nhap%20Google.', { replace: true });
      return;
    }

    let active = true;

    const exchangeTicket = async () => {
      try {
        const res = await authService.exchangeGoogleTicket({ ticket });
        if (!active) return;

        const { accessToken, refreshToken, user, redirectTo } = res.data;
        login(
          accessToken,
          refreshToken,
          {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role as 'USER' | 'ADMIN',
            avatar: user.avatarUrl,
          },
          true,
        );

        if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
          return;
        }

        navigate(redirectTo || '/', { replace: true });
      } catch (err: unknown) {
        if (!active) return;

        const code = getApiErrorCode(err);
        const message = resolveGoogleRedirectError(code, getApiErrorMessage(err, 'Đăng nhập Google thất bại.'));
        setError(message);
        navigate(
          `/login?google_error_code=${encodeURIComponent(code || 'GOOGLE_TICKET_EXCHANGE_FAILED')}&google_error_message=${encodeURIComponent(message)}`,
          { replace: true },
        );
      }
    };

    exchangeTicket();

    return () => {
      active = false;
    };
  }, [login, navigate, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-8 text-center space-y-4">
        {error ? (
          <>
            <FiAlertCircle className="mx-auto text-5xl text-red-500" />
            <h1 className="text-2xl font-bold">Đăng nhập Google thất bại</h1>
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
          </>
        ) : (
          <>
            <FiLoader className="mx-auto text-5xl text-purple-500 animate-spin" />
            <h1 className="text-2xl font-bold">Đang hoàn tất đăng nhập</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Hệ thống đang xác thực tài khoản Google và đăng nhập vào Hozitech.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
