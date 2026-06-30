import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument, BlogModel } from '../domain/blog.entity';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private readonly blogModel: BlogModel) {}

  findById(id: string): Promise<BlogDocument | null> {
    return this.blogModel.findById(id);
  }

  async findOrFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Блог не найден',
      });

    return blog;
  }

  save(blog: BlogDocument) {
    return blog.save();
  }

  removeById(id: string) {
    return this.blogModel.findByIdAndDelete(id);
  }
}
