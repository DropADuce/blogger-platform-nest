import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserDTO } from './user.types';
import { BcryptService } from './bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  // Это нужно будет позже
  // private async findByLoginOrEmail(params: { login: string; email: string }) {
  //   const [founded] = await Promise.all([
  //     this.usersRepository.findByLoginOrEmail(params.login),
  //     this.usersRepository.findByLoginOrEmail(params.email),
  //   ]).then((result) => result.filter(Boolean));
  // }

  async createUser(DTO: CreateUserDTO): Promise<string> {
    const password = await this.bcryptService.createPassword({
      password: DTO.password,
    });

    const createdUser = new this.userModel({ ...DTO, password });

    const result = await this.usersRepository.save(createdUser);

    return result.id;
  }

  async deleteUser(id: string) {
    const foundedUser = await this.usersRepository.findById(id);

    if (!foundedUser) throw new NotFoundException('Пользователь не найден');

    return this.usersRepository.removeById(id);
  }
}
