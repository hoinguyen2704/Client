import { useState, useEffect } from 'react';
import { FiZap, FiTrendingUp, FiStar, FiCpu } from 'react-icons/fi';
import { productService, cmsService } from '@/apis';
import type { ProductResponse, BannerResponse, HomeData } from '@/types';
import HeroBanner from './HeroBanner';
import ProductSection from './ProductSection';
import { SHOP } from '@/constants/shopConstants';



const INITIAL_DATA: HomeData = { banners: [], featured: [], newArrivals: [], bestSellers: [] };

export default function Home() {
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
        console.error('Lỗi load trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Map banners từ server sang format HeroBanner cần
  const heroBanners = banners.length > 0
    ? banners.map((b, i) => ({
          id: i,
          image: b.imageUrl,
          title: b.title || '',
          subtitle: '',
        }))
    : [
        { id: 0, image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=500&fit=crop', title: 'Công Nghệ Mới Nhất', subtitle: `Khám phá sản phẩm hot nhất tại ${SHOP.name}` },
        { id: 1, image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&h=500&fit=crop', title: 'Laptop Cao Cấp', subtitle: 'Hiệu năng vượt trội, giá tốt nhất' },
      ];

  return (
    <div className="pb-20">
      <HeroBanner banners={heroBanners} />

      {featured.length > 0 && (
        <ProductSection
          icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30"><FiCpu className="text-2xl" /></div>}
          title="Sản phẩm nổi bật"
          subtitle={<p className="text-sm text-slate-500">Được đề xuất cho bạn</p>}
          products={featured}
          layout="scroll"
        />
      )}

      {bestSellers.length > 0 && (
        <ProductSection
          icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30"><FiTrendingUp className="text-2xl" /></div>}
          title="Bán chạy nhất"
          products={bestSellers}
          layout="scroll"
          bgClassName="bg-slate-100 dark:bg-slate-800/50 rounded-2xl my-10"
        />
      )}

      {newArrivals.length > 0 && (
        <ProductSection
          icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"><FiStar className="text-2xl" /></div>}
          title="Hàng mới về"
          products={newArrivals}
          seeAllLink="/products"
        />
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
