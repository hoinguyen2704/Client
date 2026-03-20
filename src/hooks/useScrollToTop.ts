import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top when the route changes.
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
}
