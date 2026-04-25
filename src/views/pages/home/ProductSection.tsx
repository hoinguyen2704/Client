import { ProductCard } from '@/components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { ProductResponse } from '@/types';

interface ProductSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  products: ProductResponse[];
  seeAllLink?: string;
  seeAllLabel?: string;
  layout?: 'grid' | 'scroll';
  bgClassName?: string;
}

export default function ProductSection({ 
  icon, title, subtitle, products, seeAllLink, seeAllLabel, layout = 'grid', bgClassName = '' 
}: ProductSectionProps) {
  const { t } = useTranslation('home');
  if (!products.length) return null;

  return (
    <section className={`w-full px-4 py-5 md:px-8 md:py-6 lg:px-12 lg:py-7  ${bgClassName} m-12 rounded-2xl shadow-sm border border-slate-200`}>
      <div className="mb-5 flex items-center justify-between sm:mb-6 ">
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
        </div>
        {seeAllLink && (
          <Link to={seeAllLink} className="font-semibold text-blue-700 transition-colors hover:text-blue-800">
            {seeAllLabel || t('sections.seeAll')}
          </Link>
        )}
      </div>
      
      {layout === 'scroll' ? (
        <div className="custom-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 sm:gap-4 md:gap-5">
          {products.map(product => (
            <div key={product.id} className="w-[220px] shrink-0 snap-start md:w-[240px] xl:w-[248px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
