import { FiZap, FiTrendingUp, FiStar, FiCpu } from 'react-icons/fi';
import { mockProducts } from '@/__mocks__/mockData';
import { homeBanners as banners } from '@/__mocks__/mockAdmin';
import HeroBanner from './HeroBanner';
import ProductSection from './ProductSection';

export default function Home() {
  const flashSaleProducts = mockProducts.filter(p => p.isFlashSale);
  const bestSellers = mockProducts.sort((a, b) => b.sold - a.sold).slice(0, 4);
  const newArrivals = mockProducts.filter(p => p.isNew);
  const aiRecommended = mockProducts.slice(2, 7);

  return (
    <div className="pb-20">
      <HeroBanner banners={banners} />

      <ProductSection
        icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30"><FiCpu className="text-2xl" /></div>}
        title="Gợi ý cho bạn"
        subtitle={<p className="text-sm text-slate-500">Dựa trên lịch sử xem của bạn</p>}
        products={aiRecommended}
        layout="scroll"
      />

      <ProductSection
        icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30"><FiZap className="text-2xl" /></div>}
        title="Flash Sale"
        subtitle={
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Kết thúc trong:</span>
            <div className="flex gap-1 text-sm font-bold">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md">02</span>:
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md">45</span>:
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md">12</span>
            </div>
          </div>
        }
        products={flashSaleProducts}
        seeAllLink="/flash-sale"
      />

      <ProductSection
        icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30"><FiTrendingUp className="text-2xl" /></div>}
        title="Bán chạy nhất"
        products={bestSellers}
        layout="scroll"
        bgClassName="bg-slate-100 dark:bg-slate-800/50 rounded-2xl my-10"
      />

      <ProductSection
        icon={<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"><FiStar className="text-2xl" /></div>}
        title="Hàng mới về"
        products={newArrivals}
        seeAllLink="/search"
      />
    </div>
  );
}
