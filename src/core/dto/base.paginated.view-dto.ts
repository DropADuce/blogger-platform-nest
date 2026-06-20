export abstract class PaginatedViewDto<Item> {
  abstract items: Array<Item>;
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;

  public static mapToView<Item>(data: {
    items: Array<Item>;
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<Item> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}
