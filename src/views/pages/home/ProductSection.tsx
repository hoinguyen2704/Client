import { ProductCard } from '@/components';
import { Link } from 'react-router-dom';
import type { ProductResponse } from '@/types';

interface ProductSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  products: ProductResponse[];
  seeAllLink?: string;
  layout?: 'grid' | 'scroll';
  bgClassName?: string;
}

export default function ProductSection({ 
  icon, title, subtitle, products, seeAllLink, layout = 'grid', bgClassName = '' 
}: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section className={`w-full px-4 md:px-8 lg:px-12 py-10 ${bgClassName}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
        </div>
        {seeAllLink && (
          <Link to={seeAllLink} className="text-purple-600 font-medium hover:underline">Xem tất cả</Link>
        )}
      </div>
      
      {layout === 'scroll' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map(product => (
            <div key={product.id} className="min-w-[240px] md:min-w-[280px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
