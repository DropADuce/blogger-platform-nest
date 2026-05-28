import { PaginationResult } from '../types/pagination-result.type';

export const createPaginatedResult = <T>(params: {
  pageNumber: number;
  pageSize: number;
  count: number;
  items: Array<T>;
}): PaginationResult<T> => ({
  page: params.pageNumber,
  pageSize: params.pageSize,
  pagesCount: Math.ceil(params.count / params.pageSize),
  totalCount: params.count,
  items: params.items,
});
