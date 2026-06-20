import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserModel } from '../../domain/user.entity';

@Injectable()
export class UsersExternalRepository {
  constructor(@InjectModel(User.name) private readonly user: UserModel) {}

  removeAll() {
    return this.user.deleteMany({});
  }
}
