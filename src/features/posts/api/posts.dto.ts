import { SortPaginationQuery } from '../../../shared/pagination';

export type CreatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type UpdatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostsQueryParams = SortPaginationQuery;
export type CommentsQueryParams = SortPaginationQuery;
