import { SortPaginationQuery } from '../../../shared/pagination';

export type CreateUserDTO = {
  login: string;
  password: string;
  email: string;
};

export type GetUsersQueryParams = SortPaginationQuery & {
  searchLoginTerm: string;
  searchEmailTerm: string;
};
