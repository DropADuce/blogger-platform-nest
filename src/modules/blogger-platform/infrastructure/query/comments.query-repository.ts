import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';

import { Comment, CommentModel } from '../../domain/comment.entity';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly comment: CommentModel,
  ) {}

  async findByIdOrFail(id: string) {
    const comment = await this.comment.findById(id);

    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Комментарий не найден',
      });

    return comment;
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
        .limit(params.query.pageSize),
      this.comment.countDocuments(filter),
    ]);

    return { comments, count };
  }
}
