import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument, PostModel } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private readonly postModel: PostModel) {}

  findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id);
  }

  async findOrFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) throw new NotFoundException('Пост не найден');

    return post;
  }

  getByBlogId(blogId: string): Promise<Array<PostDocument>> {
    return this.postModel.find({ blogId });
  }

  save(post: PostDocument) {
    return post.save();
  }

  removeById(id: string) {
    return this.postModel.findByIdAndDelete(id);
  }
}
