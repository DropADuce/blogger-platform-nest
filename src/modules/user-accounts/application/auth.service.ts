import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BcryptService } from './bcrypt.service';
import { UsersRepository } from '../infrastructure/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async validate(params: { loginOrEmail: string; password: string }) {
    const user = await this.usersRepository.findByLoginOrEmail(
      params.loginOrEmail,
    );

    const isPasswordValid = await this.bcryptService.comparePassword({
      password: params.password,
      hash: user?.password ?? '',
    });

    if (!user || !isPasswordValid) return null;

    return { id: user._id.toString() };
  }

  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId });

    return { accessToken };
  }
}
