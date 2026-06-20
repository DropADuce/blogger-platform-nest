import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostModel } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) throw new NotFoundException('Блог не найден');

    const post = this.postModel.createInstance({ ...dto, blogName: blog.name });
    const result = await this.postsRepository.save(post);

    return result.id;
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    const [blog, post] = await Promise.all([
      this.blogsRepository.findById(dto.blogId),
      this.postsRepository.findOrFail(id),
    ]);

    if (!blog) throw new NotFoundException('Блог не найден');

    post.updatePost({ ...dto, blogName: blog.name });

    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    await this.postsRepository.findOrFail(id);
    await this.postsRepository.removeById(id);
  }

  async updateBlogNameInPosts(blogId: string, blogName: string): Promise<void> {
    const posts = await this.postsRepository.getByBlogId(blogId);

    await Promise.all(
      posts.map((post) => {
        post.updateBlogName(blogName);
        return this.postsRepository.save(post);
      }),
    );
  }
}
