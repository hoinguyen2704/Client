//  Generic API wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode?: string;
}

//  Paginated response (matches server PageResponse<T>)
export interface PageResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

//  Pagination request params
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
  keyword?: string;
}
