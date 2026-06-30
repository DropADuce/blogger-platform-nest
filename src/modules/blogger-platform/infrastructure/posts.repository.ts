import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument, PostModel } from '../domain/post.entity';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private readonly postModel: PostModel) {}

  findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id);
  }

  async findOrFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Пост не найден',
      });

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
