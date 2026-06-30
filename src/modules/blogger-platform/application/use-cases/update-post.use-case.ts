import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdatePostDto } from 'modules/blogger-platform/dto/update-post.dto';
import { BlogsRepository } from 'modules/blogger-platform/infrastructure/blogs.repository';
import { PostsRepository } from 'modules/blogger-platform/infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    readonly postId: string,
    readonly post: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand) {
    const [blog, post] = await Promise.all([
      this.blogsRepository.findOrFail(command.post.blogId),
      this.postsRepository.findOrFail(command.postId),
    ]);

    post.updatePost({ ...command.post, blogName: blog.name });

    return this.postsRepository.save(post);
  }
}
