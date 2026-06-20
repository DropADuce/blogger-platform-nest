import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';

import {
  Comment,
  CommentDocument,
  CommentModel,
} from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly comment: CommentModel,
  ) {}

  async findCommentById(id: string) {
    const comment = await this.comment.findById(id);

    if (!comment) throw new NotFoundException('Комментарий не найден');

    return CommentViewDto.mapToView({
      comment,
      likes: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
    });
  }

  async findCommentsByPost(params: {
    postId: string;
    query: GetCommentsQueryParams;
  }) {
    const filter: QueryFilter<Comment> = { postId: params.postId };

    const [comments, count] = await Promise.all([
      this.comment
        .find(filter)
        .sort({ [params.query.sortBy]: params.query.sortDirection })
        .skip(params.query.calculateSkip())
        .limit(params.query.pageSize)
        .lean()
        .exec(),
      this.comment.countDocuments(filter),
    ]);

    const items = comments.map((comment: CommentDocument) =>
      CommentViewDto.mapToView({
        comment,
        likes: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      page: params.query.pageNumber,
      size: params.query.pageSize,
      totalCount: count,
    });
  }
}
