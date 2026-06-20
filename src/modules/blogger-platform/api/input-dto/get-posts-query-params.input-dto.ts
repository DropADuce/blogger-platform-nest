import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

type SortFields = 'title' | 'blogId' | 'blogName' | 'createdAt';

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy: SortFields = 'createdAt';
}
