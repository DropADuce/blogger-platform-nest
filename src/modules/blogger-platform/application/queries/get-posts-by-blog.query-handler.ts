import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryRepository } from 'modules/blogger-platform/infrastructure/query/posts.query-repository';
import { LikesQueryRepository } from 'modules/blogger-platform/infrastructure/query/likes.query-repository';
import { PostViewDto } from 'modules/blogger-platform/api/view-dto/post.view-dto';
import { GetPostsQueryParams } from 'modules/blogger-platform/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'core/dto/base.paginated.view-dto';

export class GetPostsByBlogQuery {
  constructor(
    readonly blogId: string,
    readonly query: GetPostsQueryParams,
    readonly userId?: string,
  ) {}
}

@QueryHandler(GetPostsByBlogQuery)
export class GetPostsByBlogHandler
  implements IQueryHandler<GetPostsByBlogQuery>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(
    query: GetPostsByBlogQuery,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    const postsResult = await this.postsQueryRepository.getByBlogIdRaw(
      query.blogId,
      query.query,
    );

    const ids = postsResult.posts.map((post) => post._id.toString());

    const likes = await this.likesQueryRepository.getExtendedLikesInfoBatch({
      ids,
      entity: 'Post',
      userId: query.userId,
    });

    const items = postsResult.posts.map((post) =>
      PostViewDto.mapToView(post, likes.get(post._id.toString())!),
    );

    return PaginatedViewDto.mapToView({
      items,
      page: query.query.pageNumber,
      size: query.query.pageSize,
      totalCount: postsResult.count,
    });
  }
}
