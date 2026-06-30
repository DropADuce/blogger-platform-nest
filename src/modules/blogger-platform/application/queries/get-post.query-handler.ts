import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryRepository } from 'modules/blogger-platform/infrastructure/query/posts.query-repository';
import { LikesQueryRepository } from 'modules/blogger-platform/infrastructure/query/likes.query-repository';
import { PostViewDto } from 'modules/blogger-platform/api/view-dto/post.view-dto';

export class GetPostQuery {
  constructor(
    readonly postId: string,
    readonly userId?: string,
  ) {}
}

@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(query: GetPostQuery) {
    const [post, likes] = await Promise.all([
      this.postsQueryRepository.findPostByIdRawOrFail(query.postId),
      this.likesQueryRepository.getExtendedLikesInfo({
        entity: 'Post',
        entityId: query.postId,
        userId: query.userId,
      }),
    ]);

    return PostViewDto.mapToView(post, likes);
  }
}
