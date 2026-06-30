import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from 'modules/blogger-platform/infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(readonly postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand) {
    await this.postsRepository.findOrFail(command.postId);

    return this.postsRepository.removeById(command.postId);
  }
}
