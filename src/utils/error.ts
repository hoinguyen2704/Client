type UnknownRecord = Record<string, unknown>;
type ErrorTranslator = (key: string, options?: Record<string, unknown>) => string;

function resolveTranslator(
  input?: ErrorTranslator | string,
): ErrorTranslator | undefined {
  return typeof input === 'function' ? input : undefined;
}

function resolveDefaultFallback(
  translator?: ErrorTranslator,
  fallbackInput?: ErrorTranslator | string,
  fallbackKey = 'common:errors.unknown',
): string {
  if (typeof fallbackInput === 'string') {
    return fallbackInput;
  }

  return translator
    ? translator(fallbackKey)
    : 'Something went wrong';
}

function flattenMessages(input: unknown): string[] {
  if (!input) return [];

  if (typeof input === 'string') {
    const msg = input.trim();
    return msg ? [msg] : [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((item) => flattenMessages(item));
  }

  if (typeof input === 'object') {
    return Object.values(input as UnknownRecord).flatMap((value) => flattenMessages(value));
  }

  return [];
}

export function getApiErrorMessage(
  error: unknown,
  translatorOrFallback?: ErrorTranslator | string,
  fallbackKey = 'common:errors.unknown',
): string {
  const translator = resolveTranslator(translatorOrFallback);
  const fallback = resolveDefaultFallback(translator, translatorOrFallback, fallbackKey);
  const raw = error as any;
  const payload = raw?.response?.data ?? raw;
  const rawMessage = typeof raw?.message === 'string' ? raw.message : '';

  if (raw?.code === 'ECONNABORTED' || rawMessage.toLowerCase().includes('timeout')) {
    return translator
      ? translator('common:errors.timeout')
      : 'The request timed out. Please try again.';
  }

  if (
    rawMessage.toLowerCase().includes('network error') ||
    rawMessage.toLowerCase().includes('failed to fetch')
  ) {
    return translator
      ? translator('common:errors.network')
      : 'Unable to connect to the server. Please check your network and try again.';
  }

  if (typeof payload === 'string') {
    return payload.trim() || fallback;
  }

  if (payload && typeof payload === 'object') {
    const mapLike = (payload as UnknownRecord).data ?? (payload as UnknownRecord).errors;
    const fieldMessages = flattenMessages(mapLike);
    if (fieldMessages.length > 0) {
      return Array.from(new Set(fieldMessages)).join('. ');
    }

    const message = (payload as UnknownRecord).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (rawMessage.trim()) {
    return rawMessage;
  }

  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  const raw = error as Record<string, unknown>;
  const payload = (raw?.response as Record<string, unknown>)?.data ?? raw;
  if (payload && typeof payload === 'object') {
    const code = (payload as Record<string, unknown>).errorCode;
    if (typeof code === 'string') return code;
  }
  return undefined;
}
