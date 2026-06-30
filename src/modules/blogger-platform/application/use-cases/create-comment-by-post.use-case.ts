import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { UsersExternalRepository } from 'modules/user-accounts/infrastructure/external-query/users.external-repository';
import { CommentsRepository } from 'modules/blogger-platform/infrastructure/comments.repository';
import { PostsRepository } from 'modules/blogger-platform/infrastructure/posts.repository';
import {
  Comment,
  CommentModel,
} from 'modules/blogger-platform/domain/comment.entity';

export class CreateCommentByPostCommand {
  constructor(
    readonly userId: string,
    readonly postId: string,
    readonly content: string,
  ) {}
}

@CommandHandler(CreateCommentByPostCommand)
export class CreateCommentByPostUseCase
  implements ICommandHandler<CreateCommentByPostCommand>
{
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: CommentModel,
    private readonly usersRepository: UsersExternalRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentByPostCommand) {
    await this.postsRepository.findOrFail(command.postId);
    const user = await this.usersRepository.findByIdOrFail(command.userId);

    const comment = this.commentModel.createInstance({
      userId: command.userId,
      userLogin: user.login,
      postId: command.postId,
      content: command.content,
    });

    return this.commentsRepository.save(comment);
  }
}
