import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './domain/blog.entity';
import { Post, PostSchema } from './domain/post.entity';
import { Comment, CommentSchema } from './domain/comment.entity';

import { BlogsController } from './api/blogs.controller';
import { PostsController } from './api/posts.controller';
import { CommentsController } from './api/comments.controller';

import { BlogsService } from './application/blogs.service';
import { PostsService } from './application/posts.service';

import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { BlogsExternalRepository } from './infrastructure/external-query/blogs.external-repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { PostsExternalRepository } from './infrastructure/external-query/posts.external-repository';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    PostsExternalRepository,
    CommentsQueryRepository,
  ],
  exports: [BlogsExternalRepository, PostsExternalRepository],
})
export class BloggerPlatformModule {}
