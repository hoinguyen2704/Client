import { Trans, useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';
import { SHOP } from '@/constants/shopConstants';

export default function Privacy() {
  const { t } = useTranslation('about');
  const sections = t('privacyPage.sections', { returnObjects: true }) as Array<{
    title: string;
    lead?: string;
    paragraphs?: string[];
    items?: string[];
  }>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('privacyPage.title')}</h1>
      
      <div className="prose prose-blue max-w-none dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('privacyPage.intro', { shopName: SHOP.name })}
        </p>

        {sections.map((section, sectionIndex) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            {section.lead ? (
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {section.lead.replace('{{shopName}}', SHOP.name)}
              </p>
            ) : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={`${sectionIndex}-${paragraph}`} className="text-gray-600 dark:text-gray-300 mb-2">
                {paragraph.replace('{{shopName}}', SHOP.name)}
              </p>
            ))}
            {section.items ? (
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                {section.items.map((_, itemIndex) => (
                  <li key={`${sectionIndex}-${itemIndex}`}>
                    <Trans
                      i18nKey={`privacyPage.sections.${sectionIndex}.items.${itemIndex}`}
                      ns="about"
                      components={{ strong: <strong /> }}
                      values={{ shopName: SHOP.name }}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <p className="text-md text-gray-500 mt-8">
          {t('privacyPage.lastUpdated', { date: formatDate(new Date()) })}
        </p>
      </div>
    </div>
  );
}
