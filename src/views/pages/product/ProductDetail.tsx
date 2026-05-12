import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { productService } from '@/apis';
import flashSaleService from '@/apis/services/flashSaleService';
import type { FlashSaleItemResponse, ProductResponse, ProductImageResponse } from '@/types';
import { Button, ProductCard } from '@/components';
import HorizontalInfiniteScroller from '@/components/ui/HorizontalInfiniteScroller';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductTabs';
import { buildFlashSaleItemMapFromItems, resolveVariantPricing } from '@/utils/pricing';
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

const RELATED_PAGE_SIZE = 8;

export default function ProductDetail() {
  const { t } = useTranslation(['catalog', 'layout']);
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [related, setRelated] = useState<ProductResponse[]>([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedHasMore, setRelatedHasMore] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false);
  const [flashItemsByVariantId, setFlashItemsByVariantId] = useState<Record<string, FlashSaleItemResponse>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setRelated([]);
      setRelatedPage(1);
      setRelatedHasMore(false);
      setRelatedLoading(false);
      setRelatedLoadingMore(false);
      setFlashItemsByVariantId({});
      try {
        const productRes = await productService.getBySlug(slug);
        if (cancelled) return;

        const loadedProduct = keepActiveVariants(productRes.data);
        setProduct(loadedProduct);
        setLoading(false);

        const variantIds = (loadedProduct?.variants || [])
          .map((variant) => variant.id)
          .filter((variantId): variantId is string => Boolean(variantId));
        if (variantIds.length > 0) {
          flashSaleService.getActiveItemsForVariants(variantIds)
            .then((flashSaleRes) => {
              if (cancelled) return;
              setFlashItemsByVariantId(buildFlashSaleItemMapFromItems(flashSaleRes?.data || []));
            })
            .catch(() => {
              if (cancelled) return;
              setFlashItemsByVariantId({});
            });
        }

        if (loadedProduct?.category?.slug) {
          setRelatedLoading(true);
          productService.search({
            categorySlug: loadedProduct.category.slug,
            page: 1,
            size: RELATED_PAGE_SIZE,
            sortBy: 'createdAt',
            sortDir: 'DESC',
          })
          .then((relRes) => {
            if (cancelled) return;
            setRelated((relRes.data?.data || []).filter((p: ProductResponse) => p.slug !== slug));
            setRelatedPage(relRes.data?.page || 1);
            setRelatedHasMore((relRes.data?.page || 1) < (relRes.data?.lastPage || 1));
          })
          .catch(() => {
            if (cancelled) return;
            setRelated([]);
            setRelatedPage(1);
            setRelatedHasMore(false);
          })
          .finally(() => {
            if (cancelled) return;
            setRelatedLoading(false);
          });
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load product details:', err);
        toast.error(t('productDetail.toasts.loadFailed', { ns: 'catalog' }));
        setProduct(null);
        setRelated([]);
        setRelatedLoading(false);
        setFlashItemsByVariantId({});
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  const loadMoreRelatedProducts = useCallback(async () => {
    if (!product?.category?.slug || !slug || !relatedHasMore || relatedLoadingMore) {
      return;
    }

    const nextPage = relatedPage + 1;
    setRelatedLoadingMore(true);
    try {
      const relRes = await productService.search({
        categorySlug: product.category.slug,
        page: nextPage,
        size: RELATED_PAGE_SIZE,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      });
      const pageData = relRes.data;
      const nextItems = (pageData?.data || []).filter((item: ProductResponse) => item.slug !== slug);
      setRelated((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNextItems = nextItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNextItems];
      });
      setRelatedPage(pageData?.page || nextPage);
      setRelatedHasMore((pageData?.page || nextPage) < (pageData?.lastPage || nextPage));
    } catch {
      setRelatedHasMore(false);
    } finally {
      setRelatedLoadingMore(false);
    }
  }, [product?.category?.slug, relatedHasMore, relatedLoadingMore, relatedPage, slug]);

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
    
    // Gộp cả ảnh phân loại và ảnh chung, dùng Set để loại bỏ các ảnh trùng lặp
    const allImgs = [...variantImgs, ...productImgs];
    const gallery = Array.from(new Set(allImgs));
    
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

      <ProductTabs key={product.id} product={product} images={finalGalleryImages} />

      <HorizontalInfiniteScroller
        title={t('productDetail.relatedTitle', { ns: 'catalog' })}
        items={related}
        getItemKey={(item) => item.id}
        renderItem={(item) => <ProductCard product={item} />}
        hasMore={relatedHasMore}
        loading={relatedLoading}
        loadingMore={relatedLoadingMore}
        onLoadMore={loadMoreRelatedProducts}
      />
    </div>
  );
}
