import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModel } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModel,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.blogModel.createInstance(dto);
    const result = await this.blogsRepository.save(blog);
    return result.id;
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.findOrFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    const posts = await this.postsRepository.getByBlogId(blog.id);

    await Promise.all(
      posts.map((post) => {
        post.updateBlogName(dto.name);
        return this.postsRepository.save(post);
      }),
    );
  }

  async deleteBlog(id: string): Promise<void> {
    await this.blogsRepository.findOrFail(id);
    await this.blogsRepository.removeById(id);
  }
}
