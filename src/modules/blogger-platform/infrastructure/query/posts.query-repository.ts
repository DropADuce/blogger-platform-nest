import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';

import { Post, PostModel } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private readonly post: PostModel) {}

  async getAllRaw(query: GetPostsQueryParams) {
    const [posts, count] = await Promise.all([
      this.post
        .find()
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize),
      this.post.countDocuments(),
    ]);

    return { posts, count };
  }

  async getByBlogIdRaw(blogId: string, query: GetPostsQueryParams) {
    const filter: QueryFilter<Post> = { blogId };

    const [posts, count] = await Promise.all([
      this.post
        .find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize),
      this.post.countDocuments(filter),
    ]);

    return { posts, count };
  }

  async findPostByIdRawOrFail(id: string) {
    const post = await this.post.findById(id);

    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Пост не найден',
      });

    return post;
  }
}
