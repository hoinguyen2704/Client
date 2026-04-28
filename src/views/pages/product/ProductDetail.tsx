import { memo, useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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

// Pure helpers — defined outside component to avoid recreation
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

const keepActiveVariants = (product: ProductResponse | null): ProductResponse | null => {
  if (!product) return product;
  return {
    ...product,
    variants: (product.variants || []).filter((variant) => variant.active !== false),
  };
};

const RelatedProductsSection = memo(function RelatedProductsSection({
  related,
  title,
}: {
  related: ProductResponse[];
  title: string;
}) {
  if (related.length === 0) return null;

  return (
    <div>
      <h2 className="mb-8 text-2xl font-bold">{title}</h2>
      <div className="custom-scrollbar flex snap-x gap-3 overflow-x-auto pb-4 md:gap-5">
        {related.map((product) => (
          <div key={product.id} className="w-[220px] shrink-0 snap-start flex-none md:w-[240px] xl:w-[248px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default function ProductDetail() {
  const { t } = useTranslation(['catalog', 'layout']);
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

        const loadedProduct = keepActiveVariants(productRes.data);
        setProduct(loadedProduct);
        setActiveFlashSales(flashSaleRes?.data || []);

        // Fetch related products from same category
        if (loadedProduct?.category?.slug) {
          const relRes = await productService.search({ categorySlug: loadedProduct.category.slug, size: 6 });
          setRelated((relRes.data?.data || []).filter((p: ProductResponse) => p.slug !== slug));
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        toast.error(t('productDetail.toasts.loadFailed', { ns: 'catalog' }));
        setActiveFlashSales([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, t]);

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

  const activeVariant = product?.variants?.[selectedVariantIdx] || null;

  // Memoize gallery images — avoid sort + filter on every render
  const finalGalleryImages = useMemo(() => {
    if (!product) return ['https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image'];
    const productImgs = toImageUrls(sortImages(product.images || []));
    const variantImgs = activeVariant?.images ? toImageUrls(sortImages(activeVariant.images)) : [];
    const gallery = variantImgs.length > 0 ? variantImgs : productImgs;
    return gallery.length > 0 ? gallery : ['https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image'];
  }, [product, activeVariant?.images]);

  if (loading) {
    return (
      <div className="mx-auto w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-64 bg-slate-200 rounded" />
          <div className="grid gap-6 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] lg:gap-8">
            <div className="w-full aspect-square bg-slate-200 rounded-2xl" />
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
      <div className="mx-auto w-full px-4 md:px-8 lg:px-12 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('productDetail.notFound.title', { ns: 'catalog' })}</h2>
        <Button href="/products">{t('productDetail.notFound.back', { ns: 'catalog' })}</Button>
      </div>
    );
  }

  const activeFlashItem = activeVariant ? flashItemsByVariantId[activeVariant.id] : undefined;
  const { discount } = resolveVariantPricing({
    product,
    variant: activeVariant,
    flashItem: activeFlashItem,
  });

  return (
    <div className="mx-auto w-full px-4 md:px-8 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm md:text-md text-muted mb-6">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="transition-colors hover:text-blue-700 dark:hover:text-blue-300">{t('navigation.home', { ns: 'layout' })}</Link></li>
          <li><FiChevronRight /></li>
          <li><Link to="/products" className="transition-colors hover:text-blue-700 dark:hover:text-blue-300">{product.category?.name || t('navigation.products', { ns: 'layout' })}</Link></li>
          <li><FiChevronRight /></li>
          <li><span className="text-ink font-medium line-clamp-1">{product.name}</span></li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 xl:p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] lg:gap-6 xl:gap-8">
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
      <RelatedProductsSection
        related={related}
        title={t('productDetail.relatedTitle', { ns: 'catalog' })}
      />
    </div>
  );
}
