import { Injectable } from '@nestjs/common';
import { Model, QueryFilter, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../domain/users.schema';
import {
  createPaginatedResult,
  createSort,
  PaginationQuery,
} from '../../../shared/pagination';

type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private mapUserToViewModel(user: User): UserViewModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private createFilter(params: {
    login: string;
    email: string;
  }): QueryFilter<User> {
    return params.login || params.email
      ? {
          $or: [{ login: params.login }, { email: params.email }],
        }
      : {};
  }

  async getUserById(id: string): Promise<UserViewModel | null> {
    const user = await this.userModel.findById(id).lean().exec();

    if (!user) return null;
    return this.mapUserToViewModel(user);
  }

  async getUsers(params: {
    query: { login: string; email: string };
    sort?: { by: string; direction: SortOrder };
    pagination: PaginationQuery;
  }) {
    const filter = this.createFilter(params.query);
    const sort = params.sort ? createSort(params.sort) : {};

    const [users, count] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sort)
        .skip(params.pagination.skip)
        .limit(params.pagination.limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users: createPaginatedResult({
        count,
        pageSize: params.pagination.pageSize,
        pageNumber: params.pagination.pageNumber,
        items: users.map(this.mapUserToViewModel),
      }),
    };
  }
}
