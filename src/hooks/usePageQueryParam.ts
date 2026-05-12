import { useCallback, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

function parsePageParam(value: string | null): number {
  const page = Number(value || '1');
  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
}

export default function usePageQueryParam(paramName = 'page') {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialPage] = useState(() => parsePageParam(searchParams.get(paramName)));

  const syncPage = useCallback((page: number) => {
    const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
    const currentPageParam = searchParams.get(paramName);
    const expectedPageParam = safePage > 1 ? String(safePage) : null;

    if (
      currentPageParam === expectedPageParam
      || (!currentPageParam && safePage === 1)
    ) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (expectedPageParam) {
      nextParams.set(paramName, expectedPageParam);
    } else {
      nextParams.delete(paramName);
    }
    setSearchParams(nextParams, { replace: true });
  }, [paramName, searchParams, setSearchParams]);

  return {
    initialPage,
    returnTo: `${location.pathname}${location.search}`,
    syncPage,
  };
}
