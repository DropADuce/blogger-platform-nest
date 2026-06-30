import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { UserAccountsModule } from 'modules/user-accounts/user-accounts.module';

import { Blog, BlogSchema } from './domain/blog.entity';
import { Post, PostSchema } from './domain/post.entity';
import { Comment, CommentSchema } from './domain/comment.entity';
import { BlogsController } from './api/blogs.controller';
import { PostsController } from './api/posts.controller';
import { CommentsController } from './api/comments.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { BlogsExternalRepository } from './infrastructure/external-query/blogs.external-repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { PostsExternalRepository } from './infrastructure/external-query/posts.external-repository';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';
import { Like, LikeSchema } from 'modules/blogger-platform/domain/like.entity';
import { CommentsRepository } from 'modules/blogger-platform/infrastructure/comments.repository';
import { LikesService } from 'modules/blogger-platform/application/likes.service';
import { LikesRepository } from 'modules/blogger-platform/infrastructure/likes.repository';
import { UpdateLikeByCommentUseCase } from 'modules/blogger-platform/application/use-cases/update-like-by-comment.use-case';
import { LikesQueryRepository } from 'modules/blogger-platform/infrastructure/query/likes.query-repository';
import { GetCommentHandler } from 'modules/blogger-platform/application/queries/get-comment.query-handler';
import { GetCommentsByPostHandler } from 'modules/blogger-platform/application/queries/get-comments-by-post.query-handler';
import { LikesExternalRepository } from 'modules/blogger-platform/infrastructure/external-query/likes.external-repository';
import { GetPostsQueryHandler } from 'modules/blogger-platform/application/queries/get-posts.query-handler';
import { GetPostsByBlogHandler } from 'modules/blogger-platform/application/queries/get-posts-by-blog.query-handler';
import { UpdateLikeByPostUseCase } from 'modules/blogger-platform/application/use-cases/update-like-by-post.use-case';
import { GetPostQueryHandler } from 'modules/blogger-platform/application/queries/get-post.query-handler';
import { CommentsExternalRepository } from 'modules/blogger-platform/infrastructure/external-query/comments.external-repository';
import { UpdateCommentUseCase } from 'modules/blogger-platform/application/use-cases/update-comment.use-case';
import { CreateCommentByPostUseCase } from 'modules/blogger-platform/application/use-cases/create-comment-by-post.use-case';
import { CreatePostUseCase } from 'modules/blogger-platform/application/use-cases/create-post.use-case';
import { DeleteCommentUseCase } from 'modules/blogger-platform/application/use-cases/delete-comment.use-case';
import { DeletePostUseCase } from 'modules/blogger-platform/application/use-cases/delete-post.use-case';
import { UpdatePostUseCase } from 'modules/blogger-platform/application/use-cases/update-post.use-case';
import { CreateBlogUseCase } from 'modules/blogger-platform/application/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from 'modules/blogger-platform/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from 'modules/blogger-platform/application/use-cases/delete-blog.use-case';

const blogsProviders = [
  BlogsRepository,
  BlogsQueryRepository,
  BlogsExternalRepository,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

const postsProviders = [
  PostsRepository,
  PostsQueryRepository,
  PostsExternalRepository,
  GetPostQueryHandler,
  GetPostsQueryHandler,
  GetPostsByBlogHandler,
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdateLikeByPostUseCase,
  DeletePostUseCase,
];

const commentsProviders = [
  CommentsRepository,
  CommentsQueryRepository,
  CommentsExternalRepository,
  CreateCommentByPostUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

const likesProviders = [
  LikesService,
  LikesRepository,
  LikesQueryRepository,
  LikesExternalRepository,
  GetCommentHandler,
  GetCommentsByPostHandler,
  UpdateLikeByCommentUseCase,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...blogsProviders,
    ...postsProviders,
    ...commentsProviders,
    ...likesProviders,
  ],
  exports: [
    BlogsExternalRepository,
    PostsExternalRepository,
    LikesExternalRepository,
    CommentsExternalRepository,
  ],
})
export class BloggerPlatformModule {}
