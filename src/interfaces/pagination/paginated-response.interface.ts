export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages: number;
  data: T;
}
