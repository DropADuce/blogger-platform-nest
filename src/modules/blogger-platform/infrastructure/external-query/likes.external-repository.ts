import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Like, LikeModel } from 'modules/blogger-platform/domain/like.entity';

@Injectable()
export class LikesExternalRepository {
  constructor(@InjectModel(Like.name) private readonly likeModel: LikeModel) {}

  removeAll() {
    return this.likeModel.deleteMany({});
  }
}
