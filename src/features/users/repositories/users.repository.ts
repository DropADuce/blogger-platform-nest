import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../domain/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findById(id: string) {
    return this.userModel.findById(id).lean().exec();
  }

  findByLoginOrEmail(loginOrEmail: string) {
    return this.userModel
      .findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
      .lean()
      .exec();
  }

  save(user: UserDocument) {
    return user.save();
  }

  removeById(id: string) {
    return this.userModel.findByIdAndDelete(id, { returnDocument: 'before' });
  }

  removeAll() {
    return this.userModel.deleteMany({});
  }
}
