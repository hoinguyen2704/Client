import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

function buildFallbackSrc(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#e2e8f0" width="200" height="200"/><text fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle" x="100" y="105">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function OptimizedImage({ fallback, alt = '', className = '', ...props }: ImgProps) {
  const [error, setError] = useState(false);
  const { t } = useTranslation('common');
  const resolvedFallback = fallback ?? buildFallbackSrc(t('labels.noImage'));

  return (
    <img
      {...props}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className} ${error ? 'opacity-60' : ''}`}
      src={error ? resolvedFallback : props.src}
      onError={() => setError(true)}
    />
  );
}
