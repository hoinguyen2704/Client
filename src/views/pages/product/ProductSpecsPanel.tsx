import { useEffect, useMemo, useState } from 'react';
import { FiCpu } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { ExpandToggle } from '@/components';

const COLLAPSED_SPEC_COUNT = 8;
const HIGHLIGHT_SPEC_COUNT = 4;

interface ProductSpecsPanelProps {
  specEntries: Array<[string, string]>;
}

export default function ProductSpecsPanel({ specEntries }: ProductSpecsPanelProps) {
  const { t } = useTranslation('catalog');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [specEntries]);

  const highlightEntries = useMemo(
    () => specEntries.slice(0, HIGHLIGHT_SPEC_COUNT),
    [specEntries],
  );

  const visibleEntries = expanded
    ? specEntries
    : specEntries.slice(0, COLLAPSED_SPEC_COUNT);

  if (specEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <FiCpu className="text-xl" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-200">
          {t('productDetail.tabs.noSpecs')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-slate-50 p-4 dark:border-blue-900/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-700 dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-300">
              {t('productDetail.tabs.specHighlights')}
            </span>
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-50 sm:text-xl">
              {t('productDetail.tabs.specs')}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              {t('productDetail.tabs.specsIntro')}
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
            {t('productDetail.tabs.specsMeta', { count: specEntries.length })}
          </span>
        </div>

        {highlightEntries.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {highlightEntries.map(([label, value], index) => (
              <div
                key={`${label}-${index}`}
                className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 dark:border-blue-800/50 dark:bg-blue-950/20"
              >
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-blue-700/80 dark:text-blue-300/80">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleEntries.map(([label, value], index) => (
            <div
              key={`${label}-${index}`}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100 sm:text-base">
                {value}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {specEntries.length > COLLAPSED_SPEC_COUNT && (
        <div className="flex justify-center">
          <ExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((prev) => !prev)}
            expandLabel={t('productDetail.tabs.showMoreSpecs')}
            collapseLabel={t('productDetail.tabs.showLessSpecs')}
            variant="outline"
          />
        </div>
      )}
    </div>
  );
}
