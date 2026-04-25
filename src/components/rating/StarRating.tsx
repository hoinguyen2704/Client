import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { StarRatingProps } from '../ui/types';
import { STAR_LABELS, STAR_SIZE_CLASS } from '../ui/constants';

export default function StarRating({
  value,
  onChange,
  size = 'md',
  showLabel = true,
  labels = STAR_LABELS,
  readOnly = false,
}: StarRatingProps) {
  const { t } = useTranslation('common');
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || value;
  const resolvedLabel = labels === STAR_LABELS
    ? t(labels[value], { defaultValue: '' })
    : (labels[value] || '');

  if (readOnly) {
    return (
      <div className="flex items-center gap-1 text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${STAR_SIZE_CLASS[size]} ${star <= value ? 'fill-current' : 'text-subtle'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`${STAR_SIZE_CLASS[size]} focus:outline-none transition-transform hover:scale-110`}
        >
          <FiStar
            className={
              displayRating >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-subtle'
            }
          />
        </button>
      ))}
      {showLabel && (
        <span className="ml-3 text-md font-medium text-muted">
          {resolvedLabel}
        </span>
      )}
    </div>
  );
}
