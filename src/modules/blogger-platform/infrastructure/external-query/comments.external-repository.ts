import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Comment,
  CommentModel,
} from 'modules/blogger-platform/domain/comment.entity';

@Injectable()
export class CommentsExternalRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModel,
  ) {}

  removeAll() {
    return this.commentModel.deleteMany({});
  }
}
