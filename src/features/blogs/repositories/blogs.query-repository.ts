import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';

import { Blog, BlogDocument } from '../domain/blogs.schema';
import {
  createPaginatedResult,
  createSort,
  PaginationQuery,
} from '../../../shared/pagination';

type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  private mapBlogToViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

  async findBlogById(id: string): Promise<BlogViewModel | null> {
    const blog = await this.blogModel.findById(id).lean().exec();

    if (!blog) return null;

    return this.mapBlogToViewModel(blog);
  }

  async getBlogs(params: {
    query: { name: string };
    sort?: { by: string; direction: SortOrder };
    pagination: PaginationQuery;
  }) {
    const filter = params.query.name
      ? { name: { $regex: params.query.name, $options: 'i' } }
      : {};

    const sort = params.sort ? createSort(params.sort) : {};

    const [blogs, count] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort(sort)
        .skip(params.pagination.skip)
        .limit(params.pagination.limit)
        .lean()
        .exec(),
      this.blogModel.countDocuments(filter),
    ]);

    return createPaginatedResult({
      count,
      pageSize: params.pagination.pageSize,
      pageNumber: params.pagination.pageNumber,
      items: blogs.map(this.mapBlogToViewModel),
    });
  }
}
