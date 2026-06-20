import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserModel } from '../../domain/user.entity';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { QueryFilter } from 'mongoose';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DomainException, DomainExceptionCode } from 'core/exceptions';
import { MeDTO } from '../../api/view-dto/me.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private readonly user: UserModel) {}

  async me(id: string) {
    const user = await this.user.findById(id).lean().exec();

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });

    return MeDTO.mapToView(user);
  }

  async findUserById(id: string): Promise<UserViewDto> {
    const user = await this.user.findById(id).lean().exec();

    if (!user) throw new NotFoundException('Пользователь не найден');

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto>> {
    const filter: QueryFilter<User> = {};
    const orConditions: Array<QueryFilter<User>> = [];

    if (query.searchLoginTerm) {
      orConditions.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      orConditions.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const [users, count] = await Promise.all([
      this.user
        .find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize),
      this.user.countDocuments(filter),
    ]);

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: count,
    });
  }
}
