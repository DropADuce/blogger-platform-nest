import { SortPaginationQuery } from '../../../shared/pagination';

export type CreateBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type UpdateBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type CreatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
};

export type BlogsQueryParams = SortPaginationQuery & {
  searchNameTerm: string;
};

export type PostsQueryParams = SortPaginationQuery;
