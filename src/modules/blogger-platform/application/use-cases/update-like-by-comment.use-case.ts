import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from 'modules/blogger-platform/infrastructure/comments.repository';
import { LikesService } from 'modules/blogger-platform/application/likes.service';

export class UpdateLikeByCommentCommand {
  constructor(
    readonly status: 'Like' | 'Dislike' | 'None',
    readonly commentId: string,
    readonly userId: string,
  ) {}
}

@CommandHandler(UpdateLikeByCommentCommand)
export class UpdateLikeByCommentUseCase
  implements ICommandHandler<UpdateLikeByCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute(command: UpdateLikeByCommentCommand) {
    await this.commentsRepository.findOrFail(command.commentId);

    return this.likesService.updateLike({
      entity: 'Comment',
      entityId: command.commentId,
      status: command.status,
      userId: command.userId,
    });
  }
}
