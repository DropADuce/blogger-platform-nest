import { IsStringWithTrim } from 'core/decorators/validation/is-string-with-trim';
import {
  POST_CONTENT_MIN_CONSTRAINTS,
  POST_CONTENT_MAX_CONSTRAINTS,
  POST_SHORT_DESCRIPTION_MAX_CONSTRAINTS,
  POST_SHORT_DESCRIPTION_MIN_CONSTRAINTS,
  POST_TITLE_MAX_CONSTRAINTS,
  POST_TITLE_MIN_CONSTRAINTS,
} from 'modules/blogger-platform/domain/post.entity';

export class CreatePostForBlogInputDto {
  @IsStringWithTrim({
    min: POST_TITLE_MIN_CONSTRAINTS,
    max: POST_TITLE_MAX_CONSTRAINTS,
  })
  title: string;

  @IsStringWithTrim({
    min: POST_SHORT_DESCRIPTION_MIN_CONSTRAINTS,
    max: POST_SHORT_DESCRIPTION_MAX_CONSTRAINTS,
  })
  shortDescription: string;

  @IsStringWithTrim({
    min: POST_CONTENT_MIN_CONSTRAINTS,
    max: POST_CONTENT_MAX_CONSTRAINTS,
  })
  content: string;
}
