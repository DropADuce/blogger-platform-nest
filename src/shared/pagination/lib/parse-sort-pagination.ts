import { SortPaginationQuery } from '../types/sort-pagination-query.types';
import { getPaginationQuery } from './get-pagination-query';

export const parseSortPagination = (query: SortPaginationQuery) => ({
  sort: {
    by: query.sortBy ?? 'createdAt',
    direction: query.sortDirection ?? 'desc',
  },
  pagination: getPaginationQuery({
    pageSize: query.pageSize,
    pageNumber: query.pageNumber,
  }),
});
