import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BcryptService } from './bcrypt.service';
import { UsersRepository } from '../infrastructure/users.repository';
import { User, UserModel } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  DomainException,
  DomainExceptionCode,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { EmailService } from '../../notifications/application/email.service';
import { ConfirmEmailDTO } from '../dto/confirm-email.dto';
import { ResendRegistrationEmailDTO } from '../dto/resend-regestration-email.dto';
import { PasswordRecoveryDto } from '../dto/password-recovery.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly user: UserModel,
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
    private readonly emailService: EmailService,
  ) {}

  private async checkIsUserExists(params: { login: string; email: string }) {
    const [foundedByLogin, foundedByEmail] = await Promise.all([
      await this.usersRepository.findByLoginOrEmail(params.login),
      await this.usersRepository.findByLoginOrEmail(params.email),
    ]);

    const extensions: Array<Extension> = [];

    if (!!foundedByLogin)
      extensions.push({
        field: 'login',
        message: 'Пользователь с таким логином уже существует',
      });

    if (!!foundedByEmail)
      extensions.push({
        field: 'email',
        message: 'Пользователь с таким email уже сушествует',
      });

    if (!!extensions.length)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Невалидный email или login',
        extensions,
      });
  }

  private async createUser(DTO: CreateUserDto): Promise<string> {
    await this.checkIsUserExists({
      login: DTO.login,
      email: DTO.email,
    });

    const password = await this.bcryptService.createPassword({
      password: DTO.password,
    });

    const createdUser = this.user.createInstance({ ...DTO, password });

    const result = await this.usersRepository.save(createdUser);

    return result.id;
  }

  async createUserBySuperAdmin(DTO: CreateUserDto): Promise<string> {
    const userId = await this.createUser(DTO);

    const user = await this.usersRepository.findOrFail(userId);

    user.setIsConfirmed(true);

    await this.usersRepository.save(user);

    return user.id;
  }

  async registerUser(DTO: CreateUserDto) {
    const userId = await this.createUser(DTO);

    const user = await this.usersRepository.findOrFail(userId);

    this.emailService.sendConfirmationEmail({
      email: user.email,
      code: user.verificationCode!,
    });

    return user.id;
  }

  async confirmEmail(DTO: ConfirmEmailDTO) {
    const user = await this.usersRepository.findByVerificationCode(DTO.code);

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Пользователь не найден',
        extensions: [
          {
            field: 'code',
            message: 'Не возможно подтвердить email по текущему коду',
          },
        ],
      });

    if (user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email уже подтверждён',
        extensions: [{ field: 'code', message: 'Email уже подтверждён' }],
      });

    if (!user.codeExpiry || new Date() > user.codeExpiry)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Код подтверждения истёк',
        extensions: [{ field: 'code', message: 'Код подтверждения истёк' }],
      });

    user.setIsConfirmed(true);

    await this.usersRepository.save(user);
  }

  async resendRegistrationEmail(DTO: ResendRegistrationEmailDTO) {
    const user = await this.usersRepository.findUserByEmail(DTO.email);

    if (!user || user.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Пользователь не найден или подтвержден',
        extensions: [
          {
            field: 'email',
            message:
              'Пользователь с таким email не найден, или уже был подтвержден ранее',
          },
        ],
      });
    }

    user.setVerificationCode();

    await this.usersRepository.save(user);

    this.emailService.sendConfirmationEmail({
      email: DTO.email,
      code: user.verificationCode!,
    });
  }

  async passwordRecovery(DTO: PasswordRecoveryDto) {
    const user = await this.usersRepository.findUserByEmail(DTO.email);

    if (!user || !user.isConfirmed) return;

    user.setVerificationCode();

    await this.usersRepository.save(user);

    this.emailService.sendPasswordRecoveryEmail({
      email: user.email,
      code: user.verificationCode!,
    });
  }

  async setNewPassword(DTO: NewPasswordDto) {
    const user = await this.usersRepository.findByVerificationCode(
      DTO.recoveryCode,
    );

    if (!user || !user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Не возможно сбросить пароль',
        extensions: [
          {
            field: 'recoveryCode',
            message: 'Не возможно сбросить пароль по текущему коду',
          },
        ],
      });

    if (!user.codeExpiry || new Date() > user.codeExpiry)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Код восстановления истёк',
        extensions: [
          { field: 'recoveryCode', message: 'Код восстановления истёк' },
        ],
      });

    user.password = await this.bcryptService.createPassword({
      password: DTO.newPassword,
    });
    user.clearVerificationCode();

    await this.usersRepository.save(user);
  }

  async deleteUser(id: string) {
    await this.usersRepository.findOrFail(id);

    return this.usersRepository.removeUserById(id);
  }
}
