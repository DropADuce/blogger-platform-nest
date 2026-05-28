export const getPaginationQuery = (params: {
  pageSize: string;
  pageNumber: string;
}) => {
  const pageSize = Number.parseInt(params.pageSize ?? 10);
  const pageNumber = Number.parseInt(params.pageNumber ?? 1);

  const skip =
    Number.isFinite(pageSize) && Number.isFinite(pageNumber)
      ? (pageNumber - 1) * pageSize
      : 0;

  return {
    pageSize,
    pageNumber,
    skip,
    limit: pageSize,
  };
};
