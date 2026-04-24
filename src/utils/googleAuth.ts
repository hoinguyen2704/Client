function getBackendApiBaseUrl(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (!backendUrl) {
    throw new Error('Thiếu cấu hình VITE_BACKEND_URL cho đăng nhập Google.');
  }
  return backendUrl.replace(/\/+$/, '');
}

export function startGoogleLoginRedirect(returnTo = '/'): void {
  const normalizedReturnTo =
    returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : '/';

  const googleStartUrl = new URL(`${getBackendApiBaseUrl()}/auth/google/start`);
  googleStartUrl.searchParams.set('from', normalizedReturnTo);
  window.location.assign(googleStartUrl.toString());
}

export function startGoogleLinkRedirect(ticket: string, returnTo = '/user/settings'): void {
  const normalizedReturnTo =
    returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : '/user/settings';

  const googleStartUrl = new URL(`${getBackendApiBaseUrl()}/auth/google/link/start`);
  googleStartUrl.searchParams.set('ticket', ticket);
  googleStartUrl.searchParams.set('from', normalizedReturnTo);
  window.location.assign(googleStartUrl.toString());
}
