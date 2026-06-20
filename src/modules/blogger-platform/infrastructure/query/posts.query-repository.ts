import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';

import { Post, PostDocument, PostModel } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private readonly post: PostModel) {}

  async findPostById(id: string): Promise<PostViewDto> {
    const post = await this.post.findById(id).lean().exec();
    if (!post) throw new NotFoundException('Пост не найден');
    return PostViewDto.mapToView(post as PostDocument);
  }

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    const [posts, count] = await Promise.all([
      this.post
        .find()
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize),
      this.post.countDocuments(),
    ]);

    return PaginatedViewDto.mapToView({
      items: posts.map(PostViewDto.mapToView),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: count,
    });
  }

  async getByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    const filter: QueryFilter<Post> = { blogId };

    const [posts, count] = await Promise.all([
      this.post
        .find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize),
      this.post.countDocuments(filter),
    ]);

    return PaginatedViewDto.mapToView({
      items: posts.map(PostViewDto.mapToView),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: count,
    });
  }
}
