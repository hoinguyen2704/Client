import { useState, useEffect, useCallback, useRef } from 'react';
import type { PageResponse, ApiResponse, PaginationParams } from '@/types';

interface UseAdminListOptions {
  size?: number;
  extraParams?: Record<string, any>;
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;
}

interface UseAdminListReturn<T> {
  items: T[];
  loading: boolean;
  pageData: PageResponse<T> | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  page: number;
  setPage: (p: number) => void;
  /** Manually trigger a refetch */
  refetch: (options?: { silent?: boolean }) => void;
}

type FetchFn<T> = (params: PaginationParams & Record<string, any>) => Promise<ApiResponse<PageResponse<T>>>;

export default function useAdminList<T>(
  fetchFn: FetchFn<T>,
  options: UseAdminListOptions = {},
): UseAdminListReturn<T> {
  const { size = 10, extraParams, fetchOnMount = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<T> | null>(null);

  // Serialize extraParams for stable dependency tracking
  const extraParamsKey = JSON.stringify(extraParams ?? {});
  const prevExtraParamsKey = useRef(extraParamsKey);

  // Reset page to 1 when extraParams change
  useEffect(() => {
    if (prevExtraParamsKey.current !== extraParamsKey) {
      prevExtraParamsKey.current = extraParamsKey;
      setPage(1);
    }
  }, [extraParamsKey]);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (opts?.silent !== true) {
      setLoading(true);
    }
    try {
      const parsedExtra = JSON.parse(extraParamsKey);
      const res = await fetchFn({
        keyword: searchQuery || undefined,
        page,
        size,
        ...parsedExtra,
      });
      setPageData(res.data);
      setItems(res.data?.data || []);
    } catch (err) {
      console.error('useAdminList fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, searchQuery, page, size, extraParamsKey]);

  useEffect(() => {
    if (fetchOnMount) fetchData();
  }, [fetchData, fetchOnMount]);

  // Reset to page 1 when search query changes
  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  return {
    items,
    loading,
    pageData,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    page,
    setPage,
    refetch: fetchData,
  };
}
