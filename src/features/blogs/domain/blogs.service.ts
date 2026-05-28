import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Blog, BlogDocument } from './blogs.schema';
import { CreateBlogDTO, UpdateBlogDTO } from './blog.types';
import { BlogsRepository } from '../repositories/blogs.repository';
import { PostsRepository } from '../../posts/repositorits/posts.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async createBlog(DTO: CreateBlogDTO): Promise<string> {
    const createdBlog = new this.blogModel({ ...DTO, isMembership: false });

    const result = await this.blogsRepository.save(createdBlog);

    return result.id;
  }

  async updateBlog(id: string, DTO: UpdateBlogDTO) {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) throw new NotFoundException('Blog not found');

    blog.update(DTO);

    await this.blogsRepository.save(blog);

    const posts = await this.postsRepository.getPostsByBlog(blog.id);

    return await Promise.all(
      posts.map((post) => {
        post.updateBlogName(DTO.name);

        this.postsRepository.save(post);
      }),
    );
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) throw new NotFoundException('Blog not found');

    await this.blogsRepository.removeById(id);
  }
}
