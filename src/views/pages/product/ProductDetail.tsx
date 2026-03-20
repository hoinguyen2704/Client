import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { mockProducts } from '@/__mocks__/mockData';
import ProductCard from '@/components/ui/ProductCard';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductTabs';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = mockProducts.find(p => p.slug === slug) || mockProducts[0];
  const [activeImage, setActiveImage] = useState(0);

  const images = [
    product.image,
    product.image.replace('rs:fill:358:358', 'rs:fill:800:800'),
    product.image.replace('rs:fill:358:358', 'rs:fill:600:600'),
    product.image,
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-purple-600">Trang chủ</Link></li>
          <li><FiChevronRight /></li>
          <li><Link to="/search" className="hover:text-purple-600">{product.category}</Link></li>
          <li><FiChevronRight /></li>
          <li><span className="text-slate-900 dark:text-slate-100 font-medium line-clamp-1">{product.name}</span></li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <ProductGallery
            images={images}
            activeImage={activeImage}
            onImageChange={setActiveImage}
            productName={product.name}
            discount={product.discount}
          />
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductTabs product={product} images={images} />

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar">
          {mockProducts.slice(0, 6).map(p => (
            <div key={p.id} className="min-w-[240px] md:min-w-[280px] snap-start shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
