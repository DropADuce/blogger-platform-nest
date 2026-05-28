export type PaginationResult<T> = {
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
  items: Array<T>;
};
