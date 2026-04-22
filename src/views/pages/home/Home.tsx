import { useState, useEffect } from 'react';
import { FiTrendingUp, FiStar, FiCpu } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { productService, cmsService } from '@/apis';
import type { HomeData } from '@/types';
import { Skeleton } from '@/components';
import HeroBanner from './HeroBanner';
import ProductSection from './ProductSection';
import { SHOP } from '@/constants/shopConstants';



const INITIAL_DATA: HomeData = { banners: [], featured: [], newArrivals: [], bestSellers: [] };

function HeroBannerSkeleton() {
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-6">
      <div className="relative rounded-2xl overflow-hidden h-[400px] md:h-[500px] lg:h-[600px] bg-slate-100 dark:bg-slate-900">
        <Skeleton variant="rectangular" className="absolute inset-0 w-full h-full rounded-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <Skeleton width="min(520px, 60vw)" height={56} className="mb-4 rounded-2xl" />
          <Skeleton width="min(420px, 45vw)" height={28} className="mb-12 rounded-xl" />

          <div className="w-full max-w-2xl rounded-full bg-white/85 dark:bg-slate-900/85 border border-white/40 dark:border-slate-700/50 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={24} height={24} className="ml-5 shrink-0" />
              <Skeleton className="h-6 flex-1 rounded-lg" />
              <Skeleton width={126} height={56} className="rounded-full shrink-0" />
            </div>
          </div>
        </div>

        <Skeleton variant="circular" width={48} height={48} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 dark:bg-slate-700/60" />
        <Skeleton variant="circular" width={48} height={48} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 dark:bg-slate-700/60" />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          <Skeleton variant="circular" width={10} height={10} className="bg-white/60 dark:bg-slate-700/80" />
          <Skeleton variant="circular" width={10} height={10} className="bg-white/60 dark:bg-slate-700/80" />
          <Skeleton width={32} height={10} className="rounded-full bg-white/60 dark:bg-slate-700/80" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation('home');
  const [data, setData] = useState<HomeData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  const { banners, featured, newArrivals, bestSellers } = data;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bannersRes, featuredRes, newRes, bestRes] = await Promise.allSettled([
          cmsService.getBanners(),
          productService.getFeatured(8),
          productService.getNewArrivals(8),
          productService.search({ sortBy: 'createdAt', sortDir: 'desc', size: 8 }),
        ]);

        // Single setState — guaranteed 1 re-render
        setData({
          banners: bannersRes.status === 'fulfilled' ? bannersRes.value.data || [] : [],
          featured: featuredRes.status === 'fulfilled' ? featuredRes.value.data || [] : [],
          newArrivals: newRes.status === 'fulfilled' ? newRes.value.data || [] : [],
          bestSellers: bestRes.status === 'fulfilled' ? bestRes.value.data?.data || [] : [],
        });
      } catch (err) {
        console.error('Failed to load home page:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const heroBanners = banners.length > 0
    ? banners.map((b, i) => ({
          id: i,
          image: b.imageUrl,
          title: b.title || '',
          subtitle: '',
        }))
    : !loading ? [
        {
          id: 0,
          image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=500&fit=crop',
          title: t('hero.fallbackBanners.primary.title'),
          subtitle: t('hero.fallbackBanners.primary.subtitle', { shopName: SHOP.name }),
        },
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&h=500&fit=crop',
          title: t('hero.fallbackBanners.secondary.title'),
          subtitle: t('hero.fallbackBanners.secondary.subtitle'),
        },
      ] : [];

  return (
    <div className="pb-20">
      {loading ? <HeroBannerSkeleton /> : <HeroBanner banners={heroBanners} />}

      {featured.length > 0 && (
        <ProductSection
          icon={<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-950/15"><FiCpu className="text-2xl" /></div>}
          title={t('sections.featuredTitle')}
          subtitle={<p className="text-md text-slate-500">{t('sections.featuredSubtitle')}</p>}
          products={featured}
          layout="scroll"
        />
      )}

      {bestSellers.length > 0 && (
        <ProductSection
          icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30"><FiTrendingUp className="text-2xl" /></div>}
          title={t('sections.bestSellersTitle')}
          products={bestSellers}
          layout="scroll"
          bgClassName="my-10 rounded-[2rem] bg-slate-100/80 dark:bg-slate-800/50"
        />
      )}

      {newArrivals.length > 0 && (
        <ProductSection
          icon={<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/15 dark:bg-slate-100 dark:text-slate-900"><FiStar className="text-2xl" /></div>}
          title={t('sections.newArrivalsTitle')}
          products={newArrivals}
          seeAllLink="/products"
        />
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}
