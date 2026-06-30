import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateBlogDto } from 'modules/blogger-platform/dto/update-blog.dto';
import { BlogsRepository } from 'modules/blogger-platform/infrastructure/blogs.repository';
import { PostsRepository } from 'modules/blogger-platform/infrastructure/posts.repository';

export class UpdateBlogCommand {
  constructor(
    readonly id: string,
    readonly blog: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const blog = await this.blogsRepository.findOrFail(command.id);

    blog.update(command.blog);

    await this.blogsRepository.save(blog);

    const posts = await this.postsRepository.getByBlogId(command.id);

    return Promise.all(
      posts.map((post) => {
        post.updateBlogName(command.blog.name);

        return this.postsRepository.save(post);
      }),
    );
  }
}
