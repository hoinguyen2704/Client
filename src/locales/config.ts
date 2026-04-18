export const DEFAULT_LANGUAGE = 'vi' as const;
export const FALLBACK_LANGUAGE = DEFAULT_LANGUAGE;

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const I18N_NAMESPACES = [
  'common',
  'layout',
  'auth',
  'catalog',
  'checkout',
  'account',
  'adminDashboard',
  'adminSales',
  'adminCatalog',
  'adminCustomers',
  'adminSupport',
  'adminContent',
  'settings',
  'adminSettings',
] as const;
export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

export const DEFAULT_NAMESPACE = 'common' as const satisfies I18nNamespace;

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}
