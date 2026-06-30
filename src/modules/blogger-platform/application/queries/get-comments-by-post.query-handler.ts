import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCommentsQueryParams } from 'modules/blogger-platform/api/input-dto/get-comments-query-params.input-dto';
import { CommentsQueryRepository } from 'modules/blogger-platform/infrastructure/query/comments.query-repository';
import { LikesQueryRepository } from 'modules/blogger-platform/infrastructure/query/likes.query-repository';
import { CommentViewDto } from 'modules/blogger-platform/api/view-dto/comment.view-dto';
import { PaginatedViewDto } from 'core/dto/base.paginated.view-dto';

export class GetCommentsByPostQuery {
  constructor(
    readonly postId: string,
    readonly query: GetCommentsQueryParams,
    readonly userId?: string,
  ) {}
}

@QueryHandler(GetCommentsByPostQuery)
export class GetCommentsByPostHandler
  implements IQueryHandler<GetCommentsByPostQuery>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute(query: GetCommentsByPostQuery) {
    const commentsResult =
      await this.commentsQueryRepository.findCommentsByPost({
        postId: query.postId,
        query: query.query,
      });

    const entityIds = commentsResult.comments.map((item) =>
      item._id.toString(),
    );

    const likes = await this.likesQueryRepository.getLikesInfoBatch({
      entityIds,
      entity: 'Comment',
      userId: query.userId,
    });

    const items = commentsResult.comments.map((comment) =>
      CommentViewDto.mapToView({
        comment,
        likes: likes.get(comment._id.toString())!,
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      page: query.query.pageNumber,
      size: query.query.pageSize,
      totalCount: commentsResult.count,
    });
  }
}
