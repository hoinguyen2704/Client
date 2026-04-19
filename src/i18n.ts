import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  I18N_NAMESPACES,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  type I18nNamespace,
  type SupportedLanguage,
} from '@/locales/config';
import { getInitialLanguage } from '@/locales/getInitialLanguage';

type LocalePayload = Record<string, unknown>;
type LocaleLoader = () => Promise<LocalePayload>;

const localeLoaders = import.meta.glob('./locales/*/*.json', {
  import: 'default',
}) as Record<string, LocaleLoader>;

const dynamicLocaleBackend = {
  type: 'backend' as const,
  read(language: string, namespace: string, callback: (error: unknown, data: LocalePayload) => void) {
    const safeLanguage = isSupportedLanguage(language) ? language : FALLBACK_LANGUAGE;
    const safeNamespace = I18N_NAMESPACES.includes(namespace as I18nNamespace)
      ? (namespace as I18nNamespace)
      : DEFAULT_NAMESPACE;

    const preferredPath = `./locales/${safeLanguage}/${safeNamespace}.json`;
    const fallbackPath = `./locales/${FALLBACK_LANGUAGE}/${safeNamespace}.json`;
    const loader = localeLoaders[preferredPath] || localeLoaders[fallbackPath];

    if (!loader) {
      callback(null, {});
      return;
    }

    loader()
      .then((payload) => callback(null, payload))
      .catch((error) => callback(error, {}));
  },
};

i18n
  .use(dynamicLocaleBackend)
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: [DEFAULT_NAMESPACE],
    defaultNS: DEFAULT_NAMESPACE,
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
    },
  });

export async function preloadNamespaces(
  namespaces: I18nNamespace[],
  language?: SupportedLanguage,
) {
  if (language && i18n.language !== language) {
    await i18n.changeLanguage(language);
  }

  await i18n.loadNamespaces(namespaces);
}

export default i18n;
