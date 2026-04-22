import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { authService } from '@/apis';
import useAuthStore from '@/stores/useAuthStore';
import { getApiErrorCode, getApiErrorMessage } from '@/utils/error';

function resolveGoogleRedirectError(
  code: string | null | undefined,
  message: string | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (code === 'SOCIAL_NOT_LINKED') {
    return t('googleCallback.errors.socialNotLinked');
  }
  return message?.trim() || t('googleCallback.errors.failed');
}

export default function GoogleCallback() {
  const { t } = useTranslation(['auth', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  useEffect(() => {
    const ticket = searchParams.get('ticket');
    if (!ticket) {
      navigate(
        `/login?google_error_code=GOOGLE_TICKET_MISSING&google_error_message=${encodeURIComponent(t('googleCallback.errors.ticketMissing', { ns: 'auth' }))}`,
        { replace: true },
      );
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
        const message = resolveGoogleRedirectError(
          code,
          getApiErrorMessage(err, translate, 'auth:googleCallback.errors.failed'),
          (key, options) => translate(`auth:${key}`, options),
        );
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
  }, [login, navigate, searchParams, t]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-8 text-center space-y-4">
        {error ? (
          <>
            <FiAlertCircle className="mx-auto text-5xl text-red-500" />
            <h1 className="text-2xl font-bold">{t('googleCallback.errorTitle', { ns: 'auth' })}</h1>
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
          </>
        ) : (
          <>
            <FiLoader className="mx-auto text-5xl text-blue-500 animate-spin" />
            <h1 className="text-2xl font-bold">{t('googleCallback.loadingTitle', { ns: 'auth' })}</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t('googleCallback.loadingDescription', { ns: 'auth' })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
