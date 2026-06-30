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

import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';
import { JwtOptionalAuthGuard } from 'modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from 'modules/user-accounts/guards/decorators/param/extract-user-from-request-optional';
import { UserContextDTO } from 'modules/user-accounts/guards/dto/user-context.dto';
import { GetPostsByBlogQuery } from 'modules/blogger-platform/application/queries/get-posts-by-blog.query-handler';
import { GetPostQuery } from 'modules/blogger-platform/application/queries/get-post.query-handler';
import { BasicAuthGuard } from 'modules/user-accounts/guards/basic/basic-auth.guard';
import { DeleteBlogCommand } from 'modules/blogger-platform/application/use-cases/delete-blog.use-case';
import { UpdateBlogCommand } from 'modules/blogger-platform/application/use-cases/update-blog.use-case';
import { CreatePostCommand } from 'modules/blogger-platform/application/use-cases/create-post.use-case';
import { CreateBlogCommand } from 'modules/blogger-platform/application/use-cases/create-blog.use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
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
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequestOptional() user: UserContextDTO,
  ) {
    await this.blogsQueryRepository.findBlogById(id);

    return await this.queryBus.execute(
      new GetPostsByBlogQuery(id, query, user?.id),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() dto: CreateBlogInputDto) {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(dto));

    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('id') id: string,
    @Body() dto: CreatePostForBlogInputDto,
  ) {
    const post = await this.commandBus.execute(
      new CreatePostCommand(dto.title, dto.shortDescription, dto.content, id),
    );

    return await this.queryBus.execute(new GetPostQuery(post.id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogInputDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
