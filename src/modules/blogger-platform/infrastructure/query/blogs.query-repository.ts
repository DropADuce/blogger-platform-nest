import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';

import { Blog, BlogDocument, BlogModel } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private readonly blog: BlogModel) {}

  async findBlogById(id: string): Promise<BlogViewDto> {
    const blog = await this.blog.findById(id).lean().exec();
    if (!blog) throw new NotFoundException('Блог не найден');
    return BlogViewDto.mapToView(blog as BlogDocument);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto>> {
    const filter: QueryFilter<Blog> = {};

    if (query.searchNameTerm) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }

    const [blogs, count] = await Promise.all([
      this.blog
        .find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize),
      this.blog.countDocuments(filter),
    ]);

    return PaginatedViewDto.mapToView({
      items: blogs.map(BlogViewDto.mapToView),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: count,
    });
  }
}
