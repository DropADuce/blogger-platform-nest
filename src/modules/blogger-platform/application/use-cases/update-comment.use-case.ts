import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersExternalRepository } from 'modules/user-accounts/infrastructure/external-query/users.external-repository';
import { CommentsRepository } from 'modules/blogger-platform/infrastructure/comments.repository';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

export class UpdateCommentCommand {
  constructor(
    readonly userId: string,
    readonly commentId: string,
    readonly content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersExternalRepository: UsersExternalRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    await this.usersExternalRepository.findByIdOrFail(command.userId);
    const comment = await this.commentsRepository.findOrFail(command.commentId);

    if (comment.userId !== command.userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Пользователь не является автором',
      });

    comment.update({ content: command.content });

    return this.commentsRepository.save(comment);
  }
}
