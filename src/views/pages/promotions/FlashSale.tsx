import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { FiArrowRight, FiClock, FiTrendingUp, FiZap } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import flashSaleService from '@/apis/services/flashSaleService';
import type { FlashSaleItemResponse, FlashSaleResponse, TimeLeft } from '@/types';

const getTimeLeft = (endTime: string, nowMs: number): TimeLeft => {
  const diff = Math.max(0, new Date(endTime).getTime() - nowMs);
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const getSaleStatusMeta = (status: string | undefined, t: TFunction<'catalog'>) => {
  switch (status) {
    case 'SCHEDULED':
      return {
        label: t('flashSale.status.scheduled'),
        className: 'bg-white/15 text-white/90 border-white/20',
      };
    case 'ENDED':
      return {
        label: t('flashSale.status.ended'),
        className: 'bg-slate-900/15 text-white/90 border-white/20',
      };
    default:
      return {
        label: t('flashSale.status.active'),
        className: 'bg-white text-red-600 border-white/80 shadow-lg shadow-red-900/10',
      };
  }
};

function FlashSaleItemCard({ item }: { item: FlashSaleItemResponse }) {
  const { t } = useTranslation('catalog');
  const safeFlashStock = Math.max(0, item.flashStock || 0);
  const safeSoldCount = Math.max(0, item.soldCount || 0);
  const safeRemainingStock = Math.max(0, item.remainingStock || 0);
  const soldPercent = safeFlashStock > 0
    ? clampPercent(Math.round((safeSoldCount / safeFlashStock) * 100))
    : 0;
  const discount = item.originalPrice > 0 && item.flashPrice > 0 && item.originalPrice > item.flashPrice
    ? Math.round(((item.originalPrice - item.flashPrice) / item.originalPrice) * 100)
    : 0;
  const savedAmount = Math.max(0, item.originalPrice - item.flashPrice);
  const soldOut = safeRemainingStock <= 0;
  const productUrl = `/product/${item.productSlug || item.productId}`;

  return (
    <Link
      to={productUrl}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_22px_56px_rgba(239,68,68,0.14)] dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-red-900/40"
    >
      <div className="relative aspect-[4/4.15] overflow-hidden bg-[radial-gradient(circle_at_top,#fff1f2_0%,#ffffff_55%,#fff7ed_100%)] dark:bg-[radial-gradient(circle_at_top,#3f1d1d_0%,#0f172a_60%,#111827_100%)]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <FiZap className="text-5xl" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {discount > 0 ? (
            <span className="inline-flex items-center rounded-full border border-white/80 bg-gradient-to-r from-red-500 via-red-500 to-orange-500 px-3 py-1.5 text-sm font-black tracking-tight text-white shadow-[0_14px_28px_rgba(239,68,68,0.34)] ring-4 ring-white/55 sm:text-[15px]">
              -{discount}%
            </span>
          ) : (
            <span />
          )}

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-black tracking-tight shadow-lg backdrop-blur-md sm:text-sm ${soldOut
              ? 'border-red-200/80 bg-red-500/95 text-white shadow-red-500/25'
              : 'border-slate-900/10 bg-slate-950/78 text-white shadow-black/20'
            }`}>
            {!soldOut ? <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" /> : null}
            {soldOut ? t('flashSale.soldOut') : t('flashSale.soldPercent', { percent: soldPercent })}
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <div className="min-h-[72px]">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-600 dark:text-white sm:text-[15px]">
            {item.productName}
          </h3>
          <p className="mt-1.5 min-h-[36px] line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
            {item.variantName || t('flashSale.defaultVariant')}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-end gap-2">
            <span className="text-lg font-black leading-none text-red-600 sm:text-[1.4rem]">
              {formatPrice(item.flashPrice)}
            </span>
            {item.originalPrice > 0 ? (
              <span className="pb-0.5 text-sm text-slate-400 line-through sm:text-sm">
                {formatPrice(item.originalPrice)}
              </span>
            ) : null}
          </div>
          {savedAmount > 0 ? (
            <p className="text-sm font-semibold text-red-500 sm:text-sm">
              {t('flashSale.savedAmount', { amount: formatPrice(savedAmount) })}
            </p>
          ) : null}
        </div>

        <div className="mt-auto rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50/60 p-3 dark:border-orange-900/30 dark:from-orange-950/20 dark:to-red-950/10">
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">{t('flashSale.progressLabel')}</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] sm:text-[11px] ${soldOut
                  ? 'bg-red-500/12 text-red-500'
                  : 'bg-orange-500/12 text-orange-600 dark:text-orange-300'
                }`}>
                {soldPercent}%
              </span>
              <span className={soldOut ? 'text-red-500' : 'text-orange-600 dark:text-orange-400'}>
                {soldOut ? t('flashSale.soldOut') : t('flashSale.remainingProducts', { count: safeRemainingStock })}
              </span>
            </div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/90 dark:bg-slate-800">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 transition-[width] duration-700 ease-out before:absolute before:inset-y-0 before:right-0 before:w-16 before:bg-gradient-to-r before:from-white/0 before:to-white/35"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t('flashSale.soldCount', { count: safeSoldCount })}</span>
            <span>{t('flashSale.dealSlots', { count: safeFlashStock })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5 text-sm font-semibold text-slate-600 transition-colors group-hover:text-red-500 dark:text-slate-300 sm:text-sm">
          <span>{soldOut ? t('flashSale.actions.viewDetails') : t('flashSale.actions.grabDeal')}</span>
          <FiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function SaleCountdown({ endTime }: { endTime: string }) {
  const { t } = useTranslation('catalog');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeLeft = getTimeLeft(endTime, nowMs);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {[
        { val: timeLeft.hours, label: t('flashSale.countdown.hours') },
        { val: timeLeft.minutes, label: t('flashSale.countdown.minutes') },
        { val: timeLeft.seconds, label: t('flashSale.countdown.seconds') },
      ].map((part) => (
        <div
          key={part.label}
          className="min-w-[72px] rounded-2xl border border-white/15 bg-white/12 px-3 py-2 text-center backdrop-blur-xl sm:min-w-[82px] sm:px-4 sm:py-3"
        >
          <div className="text-2xl font-black leading-none text-white sm:text-[2rem]">
            {String(part.val).padStart(2, '0')}
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65 sm:text-sm">
            {part.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FlashSale() {
  const { t } = useTranslation('catalog');
  const [sales, setSales] = useState<FlashSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashSaleService
      .getActiveList()
      .then((r) => setSales(r.data || []))
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  }, []);

  const activeSalesCount = sales.length;

  if (loading) {
    return (
      <div className="w-full px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-64 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-96 max-w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="h-48 bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 md:p-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-[380px] rounded-[24px] bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSalesCount === 0) {
    return (
      <div className="w-full px-4 py-12 text-center md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-[32px] border border-slate-200 bg-white px-6 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/25">
            <FiZap className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {t('flashSale.empty.title')}
          </h2>
          <p className="mt-3 max-w-md text-md leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            {t('flashSale.empty.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <div className="space-y-8 md:space-y-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm font-bold uppercase tracking-[0.18em] text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <FiZap className="text-sm" />
              {t('flashSale.heroEyebrow')}
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('flashSale.heroTitle')}
            </h1>
            <p className="mt-2 max-w-3xl text-md leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              {t('flashSale.heroDescription')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <FiTrendingUp className="text-red-500" />
            {t('flashSale.activeCampaigns', { count: activeSalesCount })}
          </div>
        </div>

        {sales.map((sale) => {
          const status = getSaleStatusMeta(sale.status, t);
          const itemCount = sale.items?.length || 0;
          const totalRemaining = (sale.items || []).reduce((sum, item) => sum + Math.max(0, item.remainingStock || 0), 0);
          const summaryText = sale.description || t('flashSale.summaryFallback');

          return (
            <section
              key={sale.id}
              className="overflow-hidden rounded-[30px] border border-orange-100/70 bg-white shadow-[0_20px_60px_rgba(249,115,22,0.08)] dark:border-orange-900/30 dark:bg-slate-900"
            >
              <div className="relative overflow-hidden border-b border-orange-100/70 bg-gradient-to-br from-[#ff3b30] via-[#ff5e1f] to-[#ff8c1a] text-white dark:border-orange-900/30">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,213,79,0.28),transparent_32%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/12 to-transparent" />

                <div className="relative grid gap-5 px-5 py-5 md:px-8 md:py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-sm font-black uppercase tracking-[0.18em] text-white/95 backdrop-blur-md">
                      <FiZap className="text-yellow-200" />
                      Flash Sale
                    </div>

                    <div className="max-w-3xl space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl font-black tracking-tight sm:text-[2.6rem]">
                          {sale.name}
                        </h2>
                        <span className={`rounded-full border px-3 py-1 text-sm font-bold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                        {summaryText}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 text-sm font-semibold text-white/85">
                      <span className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                        {t('flashSale.campaignProducts', { count: itemCount })}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                        {t('flashSale.campaignRemaining', { count: totalRemaining })}
                      </span>
                    </div>
                  </div>

                  <div className="w-full max-w-full rounded-[26px] border border-white/15 bg-white/10 p-4 shadow-[0_12px_36px_rgba(17,24,39,0.16)] backdrop-blur-xl sm:max-w-[360px]">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
                      <FiClock className="text-base" />
                      {t('flashSale.endsIn')}
                    </div>
                    <SaleCountdown endTime={sale.endTime} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-orange-50/55 via-white to-white px-3 py-3 dark:from-orange-950/10 dark:via-slate-900 dark:to-slate-900 md:px-5 md:py-5">
                {itemCount > 0 ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5">
                    {(sale.items || []).map((item) => (
                      <FlashSaleItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/80 px-6 py-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                    {t('flashSale.emptyProducts')}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
