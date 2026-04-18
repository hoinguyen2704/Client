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
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 rounded-xl shadow-lg text-sm">
            Giảm {discount}%
          </div>
        )}
      </div>

      <div className="flex flex-wrap content-start gap-2.5 pb-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onImageChange(idx)}
            className={`relative h-[72px] w-[72px] rounded-xl overflow-hidden border bg-white transition-all dark:bg-slate-900 sm:h-20 sm:w-20 ${activeImage === idx ? 'border-purple-500 shadow-md shadow-purple-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}
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
