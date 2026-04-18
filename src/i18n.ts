import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  I18N_NAMESPACES,
  SUPPORTED_LANGUAGES,
} from '@/locales/config';
import { getInitialLanguage } from '@/locales/getInitialLanguage';
import { i18nResources } from '@/locales/resources';

i18n
  .use(initReactI18next)
  .init({
    resources: i18nResources,
    lng: getInitialLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: I18N_NAMESPACES,
    defaultNS: DEFAULT_NAMESPACE,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
