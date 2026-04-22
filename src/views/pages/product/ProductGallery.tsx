import type { ProductGalleryProps } from './types';

export default function ProductGallery({ images, activeImage, onImageChange, productName, discount }: ProductGalleryProps) {
  return (
    <div className="w-full max-w-[420px] lg:max-w-none">
      <div className="relative aspect-square max-h-[480px] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-3 group border border-slate-100 dark:border-slate-800">
        <img
          src={images[activeImage]}
          alt={productName}
          className="w-full h-full object-contain p-4 md:p-5 transition-transform duration-500 group-hover:scale-[1.03] cursor-zoom-in"
          referrerPolicy="no-referrer"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 rounded-xl bg-rose-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
            Giảm {discount}%
          </div>
        )}
      </div>

      <div className="flex flex-wrap content-start gap-2.5 pb-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onImageChange(idx)}
            className={`relative h-[72px] w-[72px] overflow-hidden rounded-xl border bg-white transition-all dark:bg-slate-900 sm:h-20 sm:w-20 ${activeImage === idx ? 'border-blue-500 shadow-sm shadow-blue-950/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
          >
            <img
              src={img}
              alt={`${productName} ${idx}`}
              className="w-full h-full object-contain p-1.5"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
