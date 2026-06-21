import { IsEmail, IsString, IsUUID, Length, Matches } from 'class-validator';

import {
  LOGIN_CONSTRAINTS,
  PASSWORD_CONSTRAINTS,
} from '../../domain/user.entity';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateUserInputDto {
  @IsStringWithTrim({
    min: LOGIN_CONSTRAINTS.MIN_LENGTH,
    max: LOGIN_CONSTRAINTS.MAX_LENGTH,
  })
  @Matches(/^[a-zA-Z0-9_-]*$/, {})
  login: string;

  @IsString()
  @IsEmail()
  @Trim()
  email: string;

  @IsString()
  @Length(PASSWORD_CONSTRAINTS.MIN_LENGTH, PASSWORD_CONSTRAINTS.MAX_LENGTH)
  @Trim()
  password: string;
}

export class ConfirmEmailDTO {
  @IsString({ message: 'Код должен UUID быть строкой' })
  @IsUUID('4', { message: 'Не валидная uuid строка' })
  code: string;
}

export class EmailResendingDTO {
  @IsEmail({}, { message: 'Не валидный email адрес' })
  email: string;
}

export class PasswordRecoveryInputDto {
  @IsEmail({}, { message: 'Не валидный email адрес' })
  email: string;
}

export class NewPasswordInputDto {
  @IsString()
  @Length(PASSWORD_CONSTRAINTS.MIN_LENGTH, PASSWORD_CONSTRAINTS.MAX_LENGTH)
  @Trim()
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
