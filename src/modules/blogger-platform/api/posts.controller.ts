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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params.input-dto';
import { JwtOptionalAuthGuard } from 'modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from 'modules/user-accounts/guards/decorators/param/extract-user-from-request-optional';
import { UserContextDTO } from 'modules/user-accounts/guards/dto/user-context.dto';
import { GetCommentsByPostQuery } from 'modules/blogger-platform/application/queries/get-comments-by-post.query-handler';
import { GetPostQuery } from 'modules/blogger-platform/application/queries/get-post.query-handler';
import { GetPostsQuery } from 'modules/blogger-platform/application/queries/get-posts.query-handler';
import { ExtractUserFromRequest } from 'modules/user-accounts/guards/decorators/param/extract-user-from-request';
import { UpdateLikeByPostCommand } from '../application/use-cases/update-like-by-post.use-case';
import { UpdateLikeStatusInputDto } from 'modules/blogger-platform/api/input-dto/update-like-status.input-dto';
import { JwtAuthGuard } from 'modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CreateCommentByPostCommand } from 'modules/blogger-platform/application/use-cases/create-comment-by-post.use-case';
import { CreateCommentInputDTO } from 'modules/blogger-platform/api/input-dto/create-comment.input-dto';
import { GetCommentQuery } from 'modules/blogger-platform/application/queries/get-comment.query-handler';
import { CreatePostCommand } from 'modules/blogger-platform/application/use-cases/create-post.use-case';
import { BasicAuthGuard } from 'modules/user-accounts/guards/basic/basic-auth.guard';
import { DeletePostCommand } from 'modules/blogger-platform/application/use-cases/delete-post.use-case';
import { UpdatePostCommand } from 'modules/blogger-platform/application/use-cases/update-post.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequestOptional() user: UserContextDTO,
  ) {
    return this.queryBus.execute(new GetPostsQuery(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  getOne(
    @Param('id') id: string,
    @ExtractUserFromRequestOptional() user: UserContextDTO,
  ) {
    return this.queryBus.execute(new GetPostQuery(id, user?.id));
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getComments(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserFromRequestOptional() user: UserContextDTO,
  ) {
    return this.queryBus.execute(
      new GetCommentsByPostQuery(id, query, user?.id),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() dto: CreatePostInputDto) {
    const post = await this.commandBus.execute(
      new CreatePostCommand(
        dto.title,
        dto.shortDescription,
        dto.content,
        dto.blogId,
      ),
    );

    return this.queryBus.execute(new GetPostQuery(post.id));
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createCommentByPost(
    @Param('id') id: string,
    @Body() createCommentDTO: CreateCommentInputDTO,
    @ExtractUserFromRequest() user: UserContextDTO,
  ) {
    const comment = await this.commandBus.execute(
      new CreateCommentByPostCommand(user.id, id, createCommentDTO.content),
    );

    return this.queryBus.execute(new GetCommentQuery(comment.id, user.id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  updatePost(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
    return this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  updateLikeStatus(
    @Param('id') id: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDTO,
  ) {
    return this.commandBus.execute(
      new UpdateLikeByPostCommand(body.likeStatus, id, user.id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  deletePost(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePostCommand(id));
  }
}
