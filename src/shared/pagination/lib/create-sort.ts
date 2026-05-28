import { SortOrder } from 'mongoose';

export const createSort = (params: {
  by: string;
  direction: SortOrder;
}): Record<string, SortOrder> => ({
  ...(params.by && params.direction && { [params.by]: params.direction }),
});
