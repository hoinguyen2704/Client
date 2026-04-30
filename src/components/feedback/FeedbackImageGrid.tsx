import { cn } from '@/utils/cn';

interface FeedbackImageGridProps {
  imageUrls: string[];
  altPrefix?: string;
  className?: string;
  imageClassName?: string;
}

export default function FeedbackImageGrid({
  imageUrls,
  altPrefix = 'Review image',
  className = '',
  imageClassName = '',
}: FeedbackImageGridProps) {
  if (imageUrls.length === 0) {
    return null;
  }

  const columnsClass = imageUrls.length === 1
    ? 'grid-cols-1 max-w-[220px]'
    : imageUrls.length === 2
      ? 'grid-cols-2 max-w-sm'
      : 'grid-cols-3';

  return (
    <div className={cn('grid gap-3', columnsClass, className)}>
      {imageUrls.map((imageUrl, index) => (
        <a
          key={`${imageUrl}-${index}`}
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
        >
          <img
            src={imageUrl}
            alt={`${altPrefix} ${index + 1}`}
            className={cn(
              'aspect-square h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]',
              imageClassName,
            )}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
