import { IsStringWithTrim } from 'core/decorators/validation/is-string-with-trim';
import {
  BLOG_DESCRIPTION_MAX_LENGTH_CONSTRAINTS,
  BLOG_DESCRIPTION_MIN_LENGTH_CONSTRAINTS,
  BLOG_NAME_MAX_LENGTH_CONSTRAINTS,
  BLOG_NAME_MIN_LENGTH_CONSTRAINTS,
} from 'modules/blogger-platform/domain/blog.entity';
import { IsUrl } from 'class-validator';

export class CreateBlogInputDto {
  @IsStringWithTrim({
    min: BLOG_NAME_MIN_LENGTH_CONSTRAINTS,
    max: BLOG_NAME_MAX_LENGTH_CONSTRAINTS,
  })
  name: string;

  @IsStringWithTrim({
    min: BLOG_DESCRIPTION_MIN_LENGTH_CONSTRAINTS,
    max: BLOG_DESCRIPTION_MAX_LENGTH_CONSTRAINTS,
  })
  description: string;

  @IsStringWithTrim({ min: 1, max: BLOG_DESCRIPTION_MAX_LENGTH_CONSTRAINTS })
  @IsUrl()
  websiteUrl: string;
}
