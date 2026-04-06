/**
 *  Price / Currency Formatting
 */

/** Format tiền VND — ví dụ: 12.500.000 ₫ */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/** Alias for formatPrice */
export const formatMoney = formatPrice;

/**
 *  Date / Time Formatting
 */

/** Format date — ví dụ: 14/03/2026 */
export function formatDate(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return String(value);
  }
}

/** Format datetime — ví dụ: 14/03/2026, 10:30 */
export function formatDateTime(value: string | Date): string {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
}

/** Format date ngắn — ví dụ: 14/03, 10:30 */
export function formatDateShort(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

/** Format date đầy đủ — ví dụ: 14/03/2026, 10:30 */
export function formatDateFull(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

/** Format date dài — ví dụ: 14 tháng 3, 2026 */
export function formatDateLong(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

/**
 *  Text Utilities
 */

/** Format relative time — ví dụ: "2 giờ trước" */
export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return formatDate(date);
}

/** Truncate text with "..." */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
