import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../../application/auth.service';
import { UserContextDTO } from 'modules/user-accounts/guards/dto/user-context.dto';
import { DomainException, DomainExceptionCode } from 'core/exceptions';
import { Extension } from 'core/exceptions/domain-exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDTO> {
    const extensions: Array<Extension> = [];

    if (!loginOrEmail)
      extensions.push({
        field: 'loginOrEmail',
        message: 'loginOrEmail обязателен',
      });

    if (!password)
      extensions.push({ field: 'password', message: 'password обязателен' });

    if (extensions.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'loginOrEmail и password обязательны',
        extensions,
      });
    }

    const user = await this.authService.validate({ loginOrEmail, password });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Некорректное имя пользователя или пароль',
      });
    }

    return user;
  }
}
