import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Blog, BlogDocument } from '../domain/blogs.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  save(blog: BlogDocument) {
    return blog.save();
  }

  findById(id: string): Promise<BlogDocument | null> {
    return this.blogModel.findById(id).exec();
  }

  removeById(id: string) {
    return this.blogModel.findByIdAndDelete(id).lean().exec();
  }

  removeAll() {
    return this.blogModel.deleteMany({});
  }
}
