import { ValidationPipe } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
} from 'core/exceptions/domain-exception';

export type ErrorMessage = {
  field: string;
  message: string;
};

export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Ошибка валидации',
          extensions: errors.map((error) => ({
            field: error.property,
            message:
              Object.values(error.constraints ?? {}).at(0) ??
              'Не корректное значение',
          })),
        }),
    });
  }
}
