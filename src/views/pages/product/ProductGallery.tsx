import type { ProductGalleryProps } from './types';

export default function ProductGallery({ images, activeImage, onImageChange, productName, discount }: ProductGalleryProps) {
  return (
    <div className="w-full lg:w-5/12">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-4 group">
        <img
          src={images[activeImage]}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
          referrerPolicy="no-referrer"
        />
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-lg">
            Giảm {discount}%
          </div>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onImageChange(idx)}
            className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 snap-start border-2 transition-all ${activeImage === idx ? 'border-purple-500 shadow-md shadow-purple-500/20' : 'border-transparent hover:border-purple-300'}`}
          >
            <img src={img} alt={`${productName} ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </div>
  );
}
