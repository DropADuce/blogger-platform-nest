import { BaseQueryParams } from 'core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum SortFields {
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  CreatedAt = 'createdAt',
}

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsEnum(SortFields)
  @IsOptional()
  sortBy: SortFields = SortFields.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
