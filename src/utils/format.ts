import i18n from '@/i18n';
import { FALLBACK_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from '@/locales/config';

const LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

function resolveLanguage(language?: string): SupportedLanguage {
  if (language && isSupportedLanguage(language)) {
    return language;
  }

  const currentLanguage = i18n.resolvedLanguage || i18n.language;
  return isSupportedLanguage(currentLanguage) ? currentLanguage : FALLBACK_LANGUAGE;
}

function resolveLocale(languageOrLocale?: string): string {
  if (!languageOrLocale) {
    return LOCALE_BY_LANGUAGE[resolveLanguage()];
  }

  if (languageOrLocale.includes('-')) {
    return languageOrLocale;
  }

  return LOCALE_BY_LANGUAGE[resolveLanguage(languageOrLocale)];
}

/**
 *  Price / Currency Formatting
 */

/** Format tiền VND — ví dụ: 12.500.000 ₫ */
export function formatPrice(value: number, locale?: string): string {
  return new Intl.NumberFormat(resolveLocale(locale), {
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
export function formatDate(value: string | Date, locale?: string): string {
  try {
    return new Date(value).toLocaleDateString(resolveLocale(locale));
  } catch {
    return String(value);
  }
}

/** Format datetime — ví dụ: 14/03/2026, 10:30 */
export function formatDateTime(value: string | Date, locale?: string): string {
  try {
    return new Date(value).toLocaleString(resolveLocale(locale));
  } catch {
    return String(value);
  }
}

/** Format date ngắn — ví dụ: 14/03, 10:30 */
export function formatDateShort(value: string | Date, locale?: string): string {
  try {
    return new Date(value).toLocaleString(resolveLocale(locale), {
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
export function formatDateFull(value: string | Date, locale?: string): string {
  try {
    return new Date(value).toLocaleString(resolveLocale(locale), {
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
export function formatDateLong(value: string | Date, locale?: string): string {
  try {
    return new Date(value).toLocaleDateString(resolveLocale(locale), {
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
export function formatRelativeTime(date: string | Date, locale?: string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const localeValue = resolveLocale(locale);
  const rtf = new Intl.RelativeTimeFormat(localeValue, { numeric: 'auto' });
  const minutes = Math.round(diff / 60000);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(minutes) < 1) return rtf.format(0, 'second');
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
  if (Math.abs(days) < 30) return rtf.format(-days, 'day');
  return formatDate(date, localeValue);
}

/** Truncate text with "..." */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
