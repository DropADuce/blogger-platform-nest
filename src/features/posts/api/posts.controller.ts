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

import {
  CommentsQueryParams,
  CreatePostDTO,
  PostsQueryParams,
  UpdatePostDTO,
} from './posts.dto';
import { PostsService } from '../domain/posts.service';
import { PostsQueryRepository } from '../repositorits/posts.query-repository';
import { parseSortPagination } from '../../../shared/pagination';
import { CommentsQueryRepository } from '../../comments/repositories/comments.query-repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getPosts(@Query() query: PostsQueryParams) {
    return this.postsQueryRepository.getPosts(parseSortPagination(query));
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsQueryRepository.getPostById(id);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query() query: CommentsQueryParams,
  ) {
    await this.postsQueryRepository.getPostById(id);

    return await this.commentsQueryRepository.findCommentsByPost({
      postId: id,
      ...parseSortPagination(query),
    });
  }

  @Post()
  async createPost(@Body() DTO: CreatePostDTO) {
    const postId = await this.postsService.createPost(DTO);

    return this.postsQueryRepository.getPostById(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() DTO: UpdatePostDTO) {
    await this.postsService.updatePost({ ...DTO, postId: id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePost(@Param('id') id: string) {
    await this.postsService.deletePost(id);
  }
}
