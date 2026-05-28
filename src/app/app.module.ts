import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from '../features/users/api/users.controller';
import { UsersService } from '../features/users/domain/users.service';
import { UsersRepository } from '../features/users/repositories/users.repository';
import { User, UserSchema } from '../features/users/domain/users.schema';
import { UsersQueryRepository } from '../features/users/repositories/users.query-repository';
import { BcryptService } from '../features/users/domain/bcrypt.service';
import { TestingController } from '../features/testing/api/testing.controller';
import { TestingService } from '../features/testing/domain/testing.service';
import { Blog, BlogSchema } from '../features/blogs/domain/blogs.schema';
import { BlogsController } from '../features/blogs/api/blogs.controller';
import { BlogsService } from '../features/blogs/domain/blogs.service';
import { BlogsRepository } from '../features/blogs/repositories/blogs.repository';
import { BlogsQueryRepository } from '../features/blogs/repositories/blogs.query-repository';
import { Post, PostSchema } from '../features/posts/domain/posts.schema';
import { PostsController } from '../features/posts/api/posts.controller';
import { PostsService } from '../features/posts/domain/posts.service';
import { PostsRepository } from '../features/posts/repositorits/posts.repository';
import { PostsQueryRepository } from '../features/posts/repositorits/posts.query-repository';
import {
  Comment,
  CommentSchema,
} from '../features/comments/domain/comment.schema';
import { CommentsController } from '../features/comments/api/comments.controller';
import { CommentsQueryRepository } from '../features/comments/repositories/comments.query-repository';
import { SETTINGS } from '../core/settings/settings';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(SETTINGS.MONGO_DB_URL, {
      dbName: SETTINGS.MONGO_DB_NAME,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    TestingController,
  ],
  providers: [
    AppService,
    BcryptService,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CommentsQueryRepository,
    TestingService,
  ],
})
export class AppModule {}
