import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Like,
  LikeDocument,
  LikeModel,
} from 'modules/blogger-platform/domain/like.entity';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private readonly likeModel: LikeModel) {}

  findExistingLike(params: {
    entity: 'Post' | 'Comment';
    entityId: string;
    userId: string;
  }) {
    return this.likeModel.findOne({
      $and: [
        { entity: params.entity },
        { entityId: params.entityId },
        { userId: params.userId },
      ],
    });
  }

  save(like: LikeDocument) {
    return like.save();
  }
}
