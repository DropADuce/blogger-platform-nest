import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { BlogsService } from '../application/blogs.service';
import { PostsService } from '../application/posts.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  getAll(@Query() query: GetBlogsQueryParams) {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.blogsQueryRepository.findBlogById(id);
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
  ) {
    await this.blogsQueryRepository.findBlogById(id);
    return this.postsQueryRepository.getByBlogId(id, query);
  }

  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto) {
    const blogId = await this.blogsService.createBlog(dto);
    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @Post(':id/posts')
  async createPostForBlog(
    @Param('id') id: string,
    @Body() dto: CreatePostForBlogInputDto,
  ) {
    const postId = await this.postsService.createPost({ blogId: id, ...dto });
    return this.postsQueryRepository.findPostById(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogInputDto) {
    return this.blogsService.updateBlog(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlog(id);
  }
}
