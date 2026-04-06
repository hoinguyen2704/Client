type UnknownRecord = Record<string, unknown>;

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

export function getApiErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  const raw = error as any;
  const payload = raw?.response?.data ?? raw;
  const rawMessage = typeof raw?.message === 'string' ? raw.message : '';

  if (raw?.code === 'ECONNABORTED' || rawMessage.toLowerCase().includes('timeout')) {
    return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
  }

  if (
    rawMessage.toLowerCase().includes('network error') ||
    rawMessage.toLowerCase().includes('failed to fetch')
  ) {
    return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
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
