import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePostDTO, UpdatePostDTO } from './posts.types';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { PostsRepository } from '../repositorits/posts.repository';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(DTO: CreatePostDTO) {
    const blog = await this.blogsRepository.findById(DTO.blogId);

    if (!blog) throw new NotFoundException('Блог не найден');

    const createdPost = new this.postModel({ ...DTO, blogName: blog.name });

    const result = await this.postsRepository.save(createdPost);

    return result.id;
  }

  async updatePost(DTO: Omit<UpdatePostDTO, 'blogName'>) {
    const [blog, post] = await Promise.all([
      this.blogsRepository.findById(DTO.blogId),
      this.postsRepository.getPostById(DTO.postId),
    ]);

    if (!blog) throw new NotFoundException('Блог не найден');
    if (!post) throw new NotFoundException('Пост не найден');

    post.updatePost({ ...DTO, blogName: blog.name });

    return await this.postsRepository.save(post);
  }

  async deletePost(postId: string) {
    const post = await this.postsRepository.getPostById(postId);

    if (!post) throw new NotFoundException('Пост не найден');

    await this.postsRepository.removePostById(postId);
  }

  deleteAll() {
    return this.postsRepository.removeAll();
  }
}
