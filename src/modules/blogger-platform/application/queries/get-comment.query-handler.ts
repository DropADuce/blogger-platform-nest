import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { CommentsQueryRepository } from 'modules/blogger-platform/infrastructure/query/comments.query-repository';
import { LikesQueryRepository } from 'modules/blogger-platform/infrastructure/query/likes.query-repository';
import { CommentViewDto } from 'modules/blogger-platform/api/view-dto/comment.view-dto';

export class GetCommentQuery {
  constructor(
    readonly commentId: string,
    readonly userId?: string,
  ) {}
}

@QueryHandler(GetCommentQuery)
export class GetCommentHandler implements IQueryHandler<GetCommentQuery> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(query: GetCommentQuery) {
    const [comment, likes] = await Promise.all([
      this.commentsQueryRepository.findByIdOrFail(query.commentId),
      this.likesQueryRepository.getLikesInfo({
        entity: 'Comment',
        entityId: query.commentId,
        userId: query.userId,
      }),
    ]);

    return CommentViewDto.mapToView({ comment, likes });
  }
}
