import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

type SortFields = 'userId' | 'userLogin' | 'content' | 'createdAt';

export class GetCommentsQueryParams extends BaseQueryParams {
  sortBy: SortFields = 'createdAt';
}
