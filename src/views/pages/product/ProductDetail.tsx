import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { toast } from 'sonner';
import { productService } from '@/apis';
import flashSaleService from '@/apis/services/flashSaleService';
import type { ProductResponse, FlashSaleResponse, ProductImageResponse } from '@/types';
import { Button, ProductCard } from '@/components';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductTabs';
import { buildFlashSaleItemMap, resolveVariantPricing } from '@/utils/pricing';
import { addRecentlyViewed } from '@/utils/recentlyViewed';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [related, setRelated] = useState<ProductResponse[]>([]);
  const [activeFlashSales, setActiveFlashSales] = useState<FlashSaleResponse[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const flashItemsByVariantId = useMemo(
    () => buildFlashSaleItemMap(activeFlashSales),
    [activeFlashSales],
  );

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, flashSaleRes] = await Promise.all([
          productService.getBySlug(slug),
          flashSaleService.getActiveList().catch(() => null),
        ]);

        const loadedProduct = productRes.data;
        setProduct(loadedProduct);
        setActiveFlashSales(flashSaleRes?.data || []);

        // Fetch related products from same category
        if (loadedProduct?.category?.slug) {
          const relRes = await productService.search({ categorySlug: loadedProduct.category.slug, size: 6 });
          setRelated((relRes.data?.data || []).filter((p: ProductResponse) => p.slug !== slug));
        }
      } catch (err) {
        console.error('Lỗi load sản phẩm:', err);
        toast.error('Không thể tải thông tin sản phẩm!');
        setActiveFlashSales([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  useEffect(() => {
    setActiveImage(0);
    setSelectedVariantIdx(0);
  }, [product?.id]);

  useEffect(() => {
    setActiveImage(0);
  }, [selectedVariantIdx]);

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.mainImageUrl || product.images?.[0]?.imageUrl,
      price: product.lowestPrice ?? product.originPrice,
    });
  }, [product]);

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
        <Button href="/products">Quay lại danh sách</Button>
      </div>
    );
  }

  const activeVariant = product.variants?.[selectedVariantIdx] || null;
  const sortImages = (images: ProductImageResponse[]) =>
    [...images].sort((a, b) => {
      const aPrimary = Boolean(a.isPrimary);
      const bPrimary = Boolean(b.isPrimary);
      if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.id.localeCompare(b.id);
    });

  const toImageUrls = (images: ProductImageResponse[]): string[] =>
    images
      .map((img) => img.imageUrl)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  const productImages = toImageUrls(sortImages(product.images || []));
  const variantImages = activeVariant?.images ? toImageUrls(sortImages(activeVariant.images)) : [];
  const galleryImages = variantImages.length > 0 ? variantImages : productImages;
  const finalGalleryImages = galleryImages.length > 0 ? galleryImages : ['https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image'];

  const activeFlashItem = activeVariant ? flashItemsByVariantId[activeVariant.id] : undefined;
  const { discount } = resolveVariantPricing({
    product,
    variant: activeVariant,
    flashItem: activeFlashItem,
  });

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
            images={finalGalleryImages}
            activeImage={activeImage}
            onImageChange={setActiveImage}
            productName={product.name}
            discount={discount}
          />
          <ProductInfo
            product={product}
            flashItemsByVariantId={flashItemsByVariantId}
            selectedVariantIdx={selectedVariantIdx}
            onSelectedVariantIdxChange={setSelectedVariantIdx}
          />
        </div>
      </div>

      <ProductTabs product={product} images={finalGalleryImages} />

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
