import { useState, useEffect, useCallback } from 'react';
import type { PageResponse, ApiResponse, PaginationParams } from '@/types';

/**
 * Generic hook for admin list pages with search + pagination.
 *
 * Usage:
 * ```tsx
 * const { items, loading, pageData, searchQuery, setSearchQuery, page, setPage, refetch } =
 *   useAdminList(adminCategoryService.getAll, { size: PAGE_SIZE.LARGE });
 * ```
 */

interface UseAdminListOptions {
  /** Items per page (default: 10) */
  size?: number;
  /** Extra fixed params merged into every request */
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
  refetch: () => void;
}

type FetchFn<T> = (params: PaginationParams & Record<string, any>) => Promise<ApiResponse<PageResponse<T>>>;

export default function useAdminList<T>(
  fetchFn: FetchFn<T>,
  options: UseAdminListOptions = {},
): UseAdminListReturn<T> {
  const { size = 10, extraParams = {}, fetchOnMount = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<T> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn({
        keyword: searchQuery || undefined,
        page,
        size,
        ...extraParams,
      });
      setPageData(res.data);
      setItems(res.data?.data || []);
    } catch (err) {
      console.error('useAdminList fetch error:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page, size]);

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
