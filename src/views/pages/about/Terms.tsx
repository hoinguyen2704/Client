import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';
import { SHOP } from '@/constants/shopConstants';

export default function Terms() {
  const { t } = useTranslation('about');
  const sections = t('termsPage.sections', { returnObjects: true }) as Array<{
    title: string;
    paragraphs?: string[];
    items?: string[];
  }>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('termsPage.title')}</h1>
      
      <div className="prose prose-blue max-w-none dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('termsPage.intro', { shopName: SHOP.name })}
        </p>

        {sections.map((section, index) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={`${index}-${paragraph}`} className="text-gray-600 dark:text-gray-300 mb-3">
                {paragraph.replace('{{shopName}}', SHOP.name)}
              </p>
            ))}
            {section.items ? (
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                {section.items.map((item) => <li key={`${index}-${item}`}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ))}

        <p className="text-md text-gray-500 mt-8">
          {t('termsPage.lastUpdated', { date: formatDate(new Date()) })}
        </p>
      </div>
    </div>
  );
}
