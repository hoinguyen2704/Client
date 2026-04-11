import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import settingsEn from './locales/en/settings.json';
import settingsVi from './locales/vi/settings.json';
import adminSettingsEn from './locales/en/adminSettings.json';
import adminSettingsVi from './locales/vi/adminSettings.json';

const resources = {
  en: {
    settings: settingsEn,
    adminSettings: adminSettingsEn,
  },
  vi: {
    settings: settingsVi,
    adminSettings: adminSettingsVi,
  },
};

const savedData = localStorage.getItem('ui');
let defaultLng = 'vi';
if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    if (parsed?.state?.language) {
      defaultLng = parsed.state.language;
    }
  } catch { /* ignore */ }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLng, // use saved language
    fallbackLng: 'vi',
    ns: ['settings', 'adminSettings'], // namespaces
    defaultNS: 'settings',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
