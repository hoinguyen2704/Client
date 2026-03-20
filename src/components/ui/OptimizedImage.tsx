import { useState } from 'react';

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const FALLBACK_SRC = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23e2e8f0" width="200" height="200"/><text fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle" x="100" y="105">No image</text></svg>';

export default function OptimizedImage({ fallback = FALLBACK_SRC, alt = '', className = '', ...props }: ImgProps) {
  const [error, setError] = useState(false);

  return (
    <img
      {...props}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className} ${error ? 'opacity-60' : ''}`}
      src={error ? fallback : props.src}
      onError={() => setError(true)}
    />
  );
}
