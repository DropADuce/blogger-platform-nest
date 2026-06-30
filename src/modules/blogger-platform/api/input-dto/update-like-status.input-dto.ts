import { IsIn } from 'class-validator';

export class UpdateLikeStatusInputDto {
  @IsIn(['Like', 'Dislike', 'None'])
  likeStatus: 'Like' | 'Dislike' | 'None';
}
