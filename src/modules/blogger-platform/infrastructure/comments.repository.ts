import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Comment,
  CommentDocument,
  CommentModel,
} from '../domain/comment.entity';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModel,
  ) {}

  async findOrFail(id: string) {
    const comment = await this.commentModel.findById(id);

    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Комментарий не найден',
      });

    return comment;
  }

  save(comment: CommentDocument) {
    return comment.save();
  }

  removeById(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}
