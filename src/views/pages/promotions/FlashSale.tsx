import { useState, useEffect } from 'react';
import { FiZap, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import flashSaleService from '@/apis/services/flashSaleService';
import type { FlashSaleResponse, TimeLeft } from '@/types';



const getTimeLeft = (endTime: string, nowMs: number): TimeLeft => {
  const diff = Math.max(0, new Date(endTime).getTime() - nowMs);
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <div className="h-72 sm:h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-12 text-center">
        <FiZap className="text-5xl sm:text-6xl text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('flashSale.empty.title')}</h2>
        <p className="text-md sm:text-base text-slate-500">{t('flashSale.empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
      {sales.map((sale) => {
        return (
          <section
            key={sale.id}
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 sm:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-6">
                <div>
                  <h1 className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3">
                    <FiZap className="text-yellow-300" />
                    FLASH SALE
                  </h1>
                  <p className="text-white/80 text-md sm:text-base mt-1 sm:mt-2">{sale.name}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <FiClock className="text-base sm:text-xl" />
                    <span className="text-sm sm:text-md">{t('flashSale.endsIn')}</span>
                  </div>
                  <SaleCountdown endTime={sale.endTime} />
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {(sale.items || []).map((item) => {
                const soldPercent = item.flashStock > 0 ? Math.round((item.soldCount / item.flashStock) * 100) : 0;
                const discount = item.originalPrice > 0
                  ? Math.round(((item.originalPrice - item.flashPrice) / item.originalPrice) * 100)
                  : 0;

                return (
                  <Link
                    to={`/product/${item.productSlug || item.productId}`}
                    key={item.id}
                    className="block bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <FiZap className="text-4xl" />
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-10 sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-4">
                      <h3 className="font-bold line-clamp-2 text-12 sm:text-md group-hover:text-red-500 transition-colors h-[34px] sm:h-[40px] mb-1.5 sm:mb-2 leading-snug">
                        {item.productName}
                      </h3>
                      <div className="text-10 sm:text-sm text-slate-500 mb-1.5 sm:mb-2 h-[28px] sm:h-[32px] line-clamp-2">
                        {item.variantName || ''}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                        <span className="text-15 sm:text-lg font-bold text-red-600">{formatPrice(item.flashPrice)}</span>
                        <span className="text-11 sm:text-md text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                      </div>
                      <div className="relative h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                      <p className="text-10 sm:text-sm text-slate-500">
                        {item.remainingStock > 0
                          ? t('flashSale.remainingProducts', { count: item.remainingStock })
                          : t('flashSale.soldOut')}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
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
    <div className="flex gap-1">
      {[
        { val: timeLeft.hours, label: t('flashSale.countdown.hours') },
        { val: timeLeft.minutes, label: t('flashSale.countdown.minutes') },
        { val: timeLeft.seconds, label: t('flashSale.countdown.seconds') },
      ].map((t, i) => (
        <div key={i} className="bg-white/20 backdrop-blur rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center min-w-[44px] sm:min-w-[56px]">
          <div className="text-lg sm:text-2xl font-black leading-none">{String(t.val).padStart(2, '0')}</div>
          <div className="text-10 sm:text-sm text-white/70">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
