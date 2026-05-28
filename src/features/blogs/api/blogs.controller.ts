import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  BlogsQueryParams,
  CreateBlogDTO,
  CreatePostDTO,
  PostsQueryParams,
  UpdateBlogDTO,
} from './blogs.dto';
import { BlogsQueryRepository } from '../repositories/blogs.query-repository';
import { BlogsService } from '../domain/blogs.service';
import { parseSortPagination } from '../../../shared/pagination';
import { PostsService } from '../../posts/domain/posts.service';
import { PostsQueryRepository } from '../../posts/repositorits/posts.query-repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(@Query() query: BlogsQueryParams) {
    return this.blogsQueryRepository.getBlogs({
      query: { name: query.searchNameTerm },
      ...parseSortPagination(query),
    });
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findBlogById(id);

    if (!blog) throw new NotFoundException('Blog not found');

    return blog;
  }

  @Get(':id/posts')
  async getPosts(@Query() query: PostsQueryParams, @Param('id') id: string) {
    return this.postsQueryRepository.getPostsByBlogId({
      blogId: id,
      ...parseSortPagination(query),
    });
  }

  @Post()
  async createBlog(@Body() DTO: CreateBlogDTO) {
    const id = await this.blogsService.createBlog(DTO);

    return this.blogsQueryRepository.findBlogById(id);
  }

  @Post(':id/posts')
  async createPost(@Param('id') id: string, @Body() DTO: CreatePostDTO) {
    const postId = await this.postsService.createPost({ blogId: id, ...DTO });

    return this.postsQueryRepository.getPostById(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() DTO: UpdateBlogDTO) {
    await this.blogsService.updateBlog(id, DTO);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
