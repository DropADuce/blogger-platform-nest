import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesService } from 'modules/blogger-platform/application/likes.service';
import { PostsRepository } from 'modules/blogger-platform/infrastructure/posts.repository';

export class UpdateLikeByPostCommand {
  constructor(
    readonly status: 'Like' | 'Dislike' | 'None',
    readonly postId: string,
    readonly userId: string,
  ) {}
}

@CommandHandler(UpdateLikeByPostCommand)
export class UpdateLikeByPostUseCase
  implements ICommandHandler<UpdateLikeByPostCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute(command: UpdateLikeByPostCommand) {
    await this.postsRepository.findOrFail(command.postId);

    return this.likesService.updateLike({
      entity: 'Post',
      entityId: command.postId,
      status: command.status,
      userId: command.userId,
    });
  }
}
