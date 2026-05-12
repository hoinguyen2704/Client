import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import type { PageResponse, ApiResponse, PaginationParams } from '@/types';
import { useDebounce } from './useDebounce';

interface UseAdminListOptions {
  size?: number;
  extraParams?: Record<string, any>;
  queryKey: string;
  staleTime?: number;
  initialPage?: number;
  initialSortBy?: string;
  initialSortDir?: "ASC" | "DESC";
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
  sortBy: string;
  sortDir: "ASC" | "DESC";
  toggleSort: (column: string) => void;
  /** Manually trigger a refetch */
  refetch: (options?: { silent?: boolean }) => void;
}

type FetchFn<T> = (params: PaginationParams & Record<string, any>) => Promise<ApiResponse<PageResponse<T>>>;
type FetchConfigurableFn<T> = (
  params: PaginationParams & Record<string, any>,
  config?: AxiosRequestConfig,
) => Promise<ApiResponse<PageResponse<T>>>;

export default function useAdminList<T>(
  fetchFn: FetchFn<T> | FetchConfigurableFn<T>,
  options: UseAdminListOptions,
): UseAdminListReturn<T> {
  const {
    size = 10,
    extraParams,
    fetchOnMount = true,
    queryKey,
    staleTime = 30_000,
    initialPage = 1,
    initialSortBy = "createdAt",
    initialSortDir = "DESC",
  } = options;

  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(() => (
    Number.isFinite(initialPage) ? Math.max(1, Math.trunc(initialPage)) : 1
  ));
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">(initialSortDir);
  const [isPending, startTransition] = useTransition();
  const deferredSearchInput = useDeferredValue(searchInput);
  const debouncedSearchQuery = useDebounce(deferredSearchInput, 400);

  const extraParamsKey = useMemo(() => JSON.stringify(extraParams ?? {}), [extraParams]);
  const prevExtraParamsKey = useRef(extraParamsKey);
  const extraParamsRef = useRef(extraParams);
  extraParamsRef.current = extraParams;

  // Reset page to 1 when extraParams change
  useEffect(() => {
    if (prevExtraParamsKey.current !== extraParamsKey) {
      prevExtraParamsKey.current = extraParamsKey;
      setPage(1);
    }
  }, [extraParamsKey]);

  const handleSetSearchQuery = useCallback((q: string) => {
    startTransition(() => {
      setSearchInput(q);
      setPage(1);
    });
  }, [startTransition]);

  const handleSetPage = useCallback((nextPage: number) => {
    startTransition(() => {
      setPage(nextPage);
    });
  }, [startTransition]);

  const toggleSort = useCallback((column: string) => {
    startTransition(() => {
      if (sortBy === column) {
        setSortDir((current) => (current === "ASC" ? "DESC" : "ASC"));
      } else {
        setSortBy(column);
        setSortDir("ASC");
      }
      setPage(1);
    });
  }, [sortBy]);

  const query = useQuery({
    queryKey: ['admin-list', queryKey, page, size, debouncedSearchQuery, extraParamsKey, sortBy, sortDir],
    queryFn: async ({ signal }) => {
      const fn = fetchFn as FetchConfigurableFn<T>;
      const res = await fn(
        {
          keyword: debouncedSearchQuery || undefined,
          page,
          size,
          sortBy,
          sortDir,
          ...(extraParamsRef.current ?? {}),
        },
        { signal },
      );
      return res.data;
    },
    enabled: fetchOnMount,
    staleTime,
    refetchOnMount: 'always',
    placeholderData: (previousData) => previousData,
  });

  const refetch = useCallback(async (_options?: { silent?: boolean }) => {
    await query.refetch();
  }, [query]);

  return {
    items: query.data?.data || [],
    loading: query.isPending || (isPending && !query.data),
    pageData: query.data || null,
    searchQuery: searchInput,
    setSearchQuery: handleSetSearchQuery,
    page,
    setPage: handleSetPage,
    sortBy,
    sortDir,
    toggleSort,
    refetch,
  };
}
