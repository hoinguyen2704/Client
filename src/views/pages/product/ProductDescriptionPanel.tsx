import { useEffect, useMemo, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ExpandToggle } from '@/components';

const COLLAPSED_DESCRIPTION_HEIGHT = 520;

interface ProductDescriptionPanelProps {
  description?: string;
}

export default function ProductDescriptionPanel({ description }: ProductDescriptionPanelProps) {
  const { t } = useTranslation('catalog');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [description]);

  const cleanedDescription = useMemo(
    () => description?.replace(/style="[^"]*max-height[^"]*"/g, '') ?? '',
    [description],
  );

  const plainText = useMemo(
    () => cleanedDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    [cleanedDescription],
  );

  const hasOverflow = plainText.length > 950 || cleanedDescription.length > 1400;

  if (!cleanedDescription) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <FiFileText className="text-xl" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-200">
          {t('productDetail.tabs.noDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-slate-50 p-4 dark:border-blue-900/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-5">
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-700 dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-300">
          {t('productDetail.tabs.descriptionBadge')}
        </span>
        <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-50 sm:text-xl">
          {t('productDetail.tabs.descriptionTitle')}
        </h3>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
          {t('productDetail.tabs.descriptionIntro')}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="relative">
          <div
            className="overflow-hidden transition-[max-height] duration-300"
            style={!expanded && hasOverflow ? { maxHeight: COLLAPSED_DESCRIPTION_HEIGHT } : undefined}
          >
            <div
              className="prose prose-slate max-w-none text-sm leading-7 prose-headings:font-bold prose-headings:text-slate-900 prose-h2:mt-8 prose-h2:text-2xl prose-h3:mt-6 prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-8 prose-strong:text-slate-900 prose-li:my-1 prose-li:text-slate-700 prose-ul:pl-5 prose-ol:pl-5 prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50/60 prose-blockquote:px-4 prose-blockquote:py-2 prose-img:mx-auto prose-img:w-full prose-img:rounded-2xl prose-img:border prose-img:border-slate-200 prose-a:text-blue-700 dark:prose-invert dark:prose-headings:text-slate-100 dark:prose-p:text-slate-300 dark:prose-strong:text-slate-100 dark:prose-li:text-slate-300 dark:prose-blockquote:border-blue-500/60 dark:prose-blockquote:bg-blue-950/20 sm:text-base lg:text-[17px]"
              dangerouslySetInnerHTML={{ __html: cleanedDescription }}
            />
          </div>

          {!expanded && hasOverflow && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-slate-900" />
          )}
        </div>
      </div>

      {hasOverflow && (
        <div className="flex justify-center">
          <ExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((prev) => !prev)}
            expandLabel={t('productDetail.tabs.showFullDescription')}
            collapseLabel={t('productDetail.tabs.showLessDescription')}
            variant="outline"
          />
        </div>
      )}
    </div>
  );
}
