import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument, UserModel } from '../domain/user.entity';
import { Injectable } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from 'core/exceptions';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  findByVerificationCode(verificationCode: string) {
    return this.userModel.findOne({ verificationCode }).exec();
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findByLoginOrEmail(loginOrEmail: string) {
    return this.userModel
      .findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
      .lean()
      .exec();
  }

  save(user: UserDocument) {
    return user.save();
  }

  async findOrFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Пользователь не найден',
      });

    return user;
  }

  removeUserById(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
