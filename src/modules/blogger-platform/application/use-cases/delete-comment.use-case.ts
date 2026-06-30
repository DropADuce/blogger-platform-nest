import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersExternalRepository } from 'modules/user-accounts/infrastructure/external-query/users.external-repository';
import { CommentsRepository } from 'modules/blogger-platform/infrastructure/comments.repository';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

export class DeleteCommentCommand {
  constructor(
    readonly userId: string,
    readonly commentId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly usersExternalRepository: UsersExternalRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: DeleteCommentCommand) {
    await this.usersExternalRepository.findByIdOrFail(command.userId);

    const comment = await this.commentsRepository.findOrFail(command.commentId);

    if (comment.userId !== command.userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Пользователь не является автором',
      });

    return this.commentsRepository.removeById(command.commentId);
  }
}
