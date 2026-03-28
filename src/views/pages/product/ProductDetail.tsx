import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { productService } from '@/apis';
import type { ProductResponse } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductTabs';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [related, setRelated] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await productService.getBySlug(slug);
        setProduct(res.data);

        // Fetch related products from same category
        if (res.data?.category?.slug) {
          const relRes = await productService.search({ categorySlug: res.data.category.slug, size: 6 });
          setRelated((relRes.data?.data || []).filter((p: ProductResponse) => p.slug !== slug));
        }
      } catch (err) {
        console.error('Lỗi load sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-64 bg-slate-200 rounded" />
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-5/12 aspect-square bg-slate-200 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-3/4 bg-slate-200 rounded" />
              <div className="h-6 w-1/2 bg-slate-200 rounded" />
              <div className="h-12 w-1/3 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="btn btn-primary">Quay lại danh sách</Link>
      </div>
    );
  }

  // Collect all images from product + variants
  const allImages: string[] = [];
  if (product.mainImageUrl) allImages.push(product.mainImageUrl);
  product.variants?.forEach(v => {
    v.images?.forEach(img => {
      if (img.imageUrl && !allImages.includes(img.imageUrl)) allImages.push(img.imageUrl);
    });
  });
  if (allImages.length === 0) allImages.push('https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image');

  // Calc price/discount using variant compareAtPrice
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : product.originPrice;
  const highestComparePrice = product.variants?.length
    ? Math.max(...product.variants.map((v: any) => v.compareAtPrice || v.price))
    : product.originPrice;
  const referencePrice = highestComparePrice > lowestPrice ? highestComparePrice : product.originPrice;
  const discount = referencePrice > lowestPrice
    ? Math.round((1 - lowestPrice / referencePrice) * 100)
    : 0;

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-purple-600">Trang chủ</Link></li>
          <li><FiChevronRight /></li>
          <li><Link to="/products" className="hover:text-purple-600">{product.category?.name || 'Sản phẩm'}</Link></li>
          <li><FiChevronRight /></li>
          <li><span className="text-slate-900 dark:text-slate-100 font-medium line-clamp-1">{product.name}</span></li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <ProductGallery
            images={allImages}
            activeImage={0}
            onImageChange={() => {}}
            productName={product.name}
            discount={discount}
          />
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductTabs product={product} images={allImages} />

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar">
            {related.map(p => (
              <div key={p.id} className="w-[240px] md:w-[280px] snap-start shrink-0 flex-none">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
