export function formatDate(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch {
    return String(value);
  }
}
export function formatDateTime(value: string | Date): string {
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return String(value);
  }
}

export function formatDateShort(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(value);
  }
}

export function formatDateFull(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(value);
  }
}

export function formatDateLong(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(value);
  }
}
