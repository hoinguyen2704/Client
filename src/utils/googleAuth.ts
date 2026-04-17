const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_FLOW_TIMEOUT_MS = 30000;

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdInitializeConfig = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
};

type GoogleIdClient = {
  initialize: (config: GoogleIdInitializeConfig) => void;
  prompt: () => void;
  cancel?: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdClient;
      };
    };
  }

  interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID?: string;
  }
}

let googleScriptPromise: Promise<void> | null = null;

function getGoogleClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('Thiếu cấu hình VITE_GOOGLE_CLIENT_ID cho đăng nhập Google.');
  }
  return clientId;
}

function getBackendApiBaseUrl(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (!backendUrl) {
    throw new Error('Thiếu cấu hình VITE_BACKEND_URL cho đăng nhập Google.');
  }
  return backendUrl.replace(/\/+$/, '');
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Không thể tải Google Identity script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không thể tải Google Identity script.'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
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

export async function requestGoogleIdToken(): Promise<string> {
  const clientId = getGoogleClientId();
  await loadGoogleIdentityScript();

  const googleId = window.google?.accounts?.id;
  if (!googleId) {
    throw new Error('Google Identity chưa sẵn sàng, vui lòng thử lại.');
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        googleId.cancel?.();
        reject(new Error('Google sign-in timed out.'));
      }
    }, GOOGLE_FLOW_TIMEOUT_MS);

    const finishSuccess = (credential: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(credential);
    };

    const finishError = (message: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      reject(new Error(message));
    };

    googleId.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      // FedCM-compatible path to avoid deprecated prompt status APIs.
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (response.credential) {
          finishSuccess(response.credential);
          return;
        }
        finishError('Không nhận được Google credential.');
      },
    });

    googleId.prompt();
  });
}
