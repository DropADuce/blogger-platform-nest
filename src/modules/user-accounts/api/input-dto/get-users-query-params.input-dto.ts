import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum SortFields {
  Login = 'login',
  Email = 'email',
  CreatedAt = 'createdAt',
}

export class GetUsersQueryParams extends BaseQueryParams {
  @IsEnum(SortFields)
  @IsOptional()
  sortBy: SortFields.CreatedAt;

  @IsString()
  @IsOptional()
  searchLoginTerm: string | null = null;

  @IsString()
  @IsOptional()
  searchEmailTerm: string | null = null;
}
