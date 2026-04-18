import { DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from './config';

const UI_STORAGE_KEY = 'ui';

export function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const savedData = window.localStorage.getItem(UI_STORAGE_KEY);
  if (!savedData) {
    return DEFAULT_LANGUAGE;
  }

  try {
    const parsed = JSON.parse(savedData) as {
      state?: {
        language?: unknown;
      };
    };

    return isSupportedLanguage(parsed?.state?.language)
      ? parsed.state.language
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}
