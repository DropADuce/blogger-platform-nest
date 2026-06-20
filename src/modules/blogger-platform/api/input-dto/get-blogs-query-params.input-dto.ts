import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

type SortFields = 'name' | 'description' | 'websiteUrl' | 'createdAt';

export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy: SortFields = 'createdAt';
  searchNameTerm: string | null = null;
}
