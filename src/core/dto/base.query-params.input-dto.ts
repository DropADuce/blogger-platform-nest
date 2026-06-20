export class BaseQueryParams {
  pageNumber: number = 1;
  pageSize: number = 10;
  sortDirection: 'asc' | 'desc' = 'desc';

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
