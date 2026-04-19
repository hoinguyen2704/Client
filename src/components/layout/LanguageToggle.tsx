import { FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import useUIStore from '@/stores/useUIStore';
import type { SupportedLanguage } from '@/locales/config';
import { cn } from '@/utils/cn';

const NEXT_LANGUAGE: Record<SupportedLanguage, SupportedLanguage> = {
  vi: 'en',
  en: 'vi',
};

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { t } = useTranslation('layout');
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const nextLanguage = NEXT_LANGUAGE[language];

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-2.5 text-body-soft transition-colors',
        className,
      )}
      aria-label={t('languageSwitcher.switchTo', {
        language: t(`languageSwitcher.name.${nextLanguage}`),
      })}
      title={t('languageSwitcher.switchTo', {
        language: t(`languageSwitcher.name.${nextLanguage}`),
      })}
    >
      <FiGlobe className="hidden sm:block text-base shrink-0" />
      <span className="text-sm font-black uppercase tracking-[0.18em]">
        {t(`languageSwitcher.short.${language}`)}
      </span>
    </button>
  );
}
