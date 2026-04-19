import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SHOP } from '@/constants/shopConstants';

export default function About() {
  const { t } = useTranslation('about');
  const whyChooseItems = t('aboutPage.sections.whyChoose.items', { returnObjects: true }) as string[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('aboutPage.title', { shopName: SHOP.name })}</h1>
      
      <div className="prose prose-blue max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('aboutPage.sections.aboutUs.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('aboutPage.sections.aboutUs.paragraphs.0', { shopName: SHOP.name })}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('aboutPage.sections.aboutUs.paragraphs.1', { shopName: SHOP.name })}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('aboutPage.sections.visionMission.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <Trans i18nKey="aboutPage.sections.visionMission.vision" ns="about" components={{ strong: <strong /> }} />
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <Trans i18nKey="aboutPage.sections.visionMission.mission" ns="about" components={{ strong: <strong /> }} />
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('aboutPage.sections.ownership.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('aboutPage.sections.ownership.paragraphs.0', { shopName: SHOP.name })}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('aboutPage.sections.whyChoose.title', { shopName: SHOP.name })}</h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            {whyChooseItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <div className="mt-12 text-center">
          <Link to="/contact" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {t('aboutPage.contactAction')}
          </Link>
        </div>
      </div>
    </div>
  );
}
