import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostModel } from '../../domain/post.entity';

@Injectable()
export class PostsExternalRepository {
  constructor(@InjectModel(Post.name) private readonly post: PostModel) {}

  removeAll() {
    return this.post.deleteMany({});
  }
}
