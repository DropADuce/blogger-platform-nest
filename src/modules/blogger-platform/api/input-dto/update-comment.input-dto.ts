import { IsString, Length } from 'class-validator';

import {
  CONTENT_CONSTRAINTS_MIN,
  CONTENT_CONSTRAINTS_MAX,
} from 'modules/blogger-platform/domain/comment.entity';

export class UpdateCommentInputDto {
  @IsString({ message: 'Контент не указан' })
  @Length(CONTENT_CONSTRAINTS_MIN, CONTENT_CONSTRAINTS_MAX)
  content: string;
}
