import { useState, useEffect } from 'react';
import { FiZap, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import flashSaleService from '@/apis/services/flashSaleService';
import type { FlashSaleResponse } from '@/types';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const getTimeLeft = (endTime: string, nowMs: number): TimeLeft => {
  const diff = Math.max(0, new Date(endTime).getTime() - nowMs);
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

export default function FlashSale() {
  const [sales, setSales] = useState<FlashSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    flashSaleService
      .getActiveList()
      .then((r) => setSales(r.data || []))
      .catch(() => setSales([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sales.length === 0) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [sales.length]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <FiZap className="text-6xl text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Chưa có Flash Sale</h2>
        <p className="text-slate-500">Hãy quay lại sau để không bỏ lỡ các ưu đãi hấp dẫn!</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {sales.map((sale) => {
        const timeLeft = getTimeLeft(sale.endTime, nowMs);

        return (
          <section
            key={sale.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black flex items-center gap-3">
                    <FiZap className="text-yellow-300" />
                    FLASH SALE
                  </h1>
                  <p className="text-white/80 mt-2">{sale.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-xl" />
                  <span className="text-sm">Kết thúc sau:</span>
                  <div className="flex gap-1">
                    {[
                      { val: timeLeft.hours, label: 'giờ' },
                      { val: timeLeft.minutes, label: 'phút' },
                      { val: timeLeft.seconds, label: 'giây' },
                    ].map((t, i) => (
                      <div key={i} className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-center min-w-[56px]">
                        <div className="text-2xl font-black">{String(t.val).padStart(2, '0')}</div>
                        <div className="text-xs text-white/70">{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(sale.items || []).map((item) => {
                const soldPercent = item.flashStock > 0 ? Math.round((item.soldCount / item.flashStock) * 100) : 0;
                const discount = item.originalPrice > 0
                  ? Math.round(((item.originalPrice - item.flashPrice) / item.originalPrice) * 100)
                  : 0;

                return (
                  <Link
                    to={`/product/${item.productSlug || item.productId}`}
                    key={item.id}
                    className="block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow group"
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
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold line-clamp-2 text-sm group-hover:text-red-500 transition-colors h-[40px] mb-2">
                        {item.productName}
                      </h3>
                      <div className="text-xs text-slate-500 mb-2 h-[32px] line-clamp-2">
                        {item.variantName || ''}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-red-600">{formatPrice(item.flashPrice)}</span>
                        <span className="text-sm text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                      </div>
                      <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.remainingStock > 0 ? `Còn ${item.remainingStock} sản phẩm` : 'Đã hết'}
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
