import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserModel } from '../../domain/user.entity';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class UsersExternalRepository {
  constructor(@InjectModel(User.name) private readonly user: UserModel) {}

  async findByIdOrFail(id: string) {
    const user = await this.user.findById(id).lean().exec();

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Пользователь не найден',
      });

    return user;
  }

  removeAll() {
    return this.user.deleteMany({});
  }
}
