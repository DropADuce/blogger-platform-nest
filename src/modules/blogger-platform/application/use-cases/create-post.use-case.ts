import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostModel } from 'modules/blogger-platform/domain/post.entity';
import { PostsRepository } from 'modules/blogger-platform/infrastructure/posts.repository';
import { BlogsRepository } from 'modules/blogger-platform/infrastructure/blogs.repository';

export class CreatePostCommand {
  constructor(
    readonly title: string,
    readonly shortDescription: string,
    readonly content: string,
    readonly blogId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog = await this.blogsRepository.findOrFail(command.blogId);

    const post = this.postModel.createInstance({
      blogName: blog.name,
      blogId: command.blogId,
      content: command.content,
      title: command.title,
      shortDescription: command.shortDescription,
    });

    return this.postsRepository.save(post);
  }
}
