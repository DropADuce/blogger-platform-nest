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

import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params.input-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  getAll(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.postsQueryRepository.findPostById(id);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParams,
  ) {
    await this.postsQueryRepository.findPostById(id);
    return this.commentsQueryRepository.findCommentsByPost({
      postId: id,
      query,
    });
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.postsService.createPost(dto);
    return this.postsQueryRepository.findPostById(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePost(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
    return this.postsService.updatePost(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
