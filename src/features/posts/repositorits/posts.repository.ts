import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post, PostDocument } from '../domain/posts.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  getPostById(id: string) {
    return this.postModel.findById(id);
  }

  getPostsByBlog(id: string) {
    return this.postModel.find({ blogId: id });
  }

  save(post: PostDocument) {
    return post.save();
  }

  removePostById(id: string) {
    return this.postModel.findByIdAndDelete(id, { returnDocument: 'before' });
  }

  removeAll() {
    return this.postModel.deleteMany();
  }
}
