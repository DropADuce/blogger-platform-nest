import {
  CONTENT_CONSTRAINTS_MAX,
  CONTENT_CONSTRAINTS_MIN,
} from 'modules/blogger-platform/domain/comment.entity';
import { IsStringWithTrim } from 'core/decorators/validation/is-string-with-trim';

export class CreateCommentInputDTO {
  @IsStringWithTrim({
    min: CONTENT_CONSTRAINTS_MIN,
    max: CONTENT_CONSTRAINTS_MAX,
  })
  content: string;
}
