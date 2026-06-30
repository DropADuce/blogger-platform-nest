import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from 'modules/blogger-platform/infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(readonly blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand) {
    await this.blogsRepository.findOrFail(command.blogId);

    return this.blogsRepository.removeById(command.blogId);
  }
}
