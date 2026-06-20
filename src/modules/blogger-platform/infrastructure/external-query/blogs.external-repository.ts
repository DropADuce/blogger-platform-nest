import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModel } from '../../domain/blog.entity';

@Injectable()
export class BlogsExternalRepository {
  constructor(@InjectModel(Blog.name) private readonly blog: BlogModel) {}

  removeAll() {
    return this.blog.deleteMany({});
  }
}
