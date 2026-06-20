import { CommentDocument } from '../../domain/comment.entity';
import { LikesViewDto } from './likes.view-dto';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: { userId: string; userLogin: string };
  createdAt: string;
  likesInfo: LikesViewDto;

  static mapToView(params: { comment: CommentDocument; likes: LikesViewDto }) {
    const dto = new CommentViewDto();

    dto.id = params.comment._id.toString();
    dto.content = params.comment.content;
    dto.createdAt = params.comment.createdAt.toISOString();

    dto.commentatorInfo = {
      userId: params.comment.userId,
      userLogin: params.comment.userLogin,
    };

    dto.likesInfo = params.likes;

    return dto;
  }
}
