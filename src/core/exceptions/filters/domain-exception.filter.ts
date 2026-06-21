import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { DomainException, DomainExceptionCode } from '../domain-exception';

@Catch(DomainException)
export class DomainHTTPExceptionFilter implements ExceptionFilter {
  private readonly domainToHTTPStatusMap = {
    [DomainExceptionCode.BadRequest]: HttpStatus.BAD_REQUEST,
    [DomainExceptionCode.ValidationError]: HttpStatus.BAD_REQUEST,
    [DomainExceptionCode.ConfirmationCodeExpired]: HttpStatus.BAD_REQUEST,
    [DomainExceptionCode.EmailNotConfirmed]: HttpStatus.BAD_REQUEST,
    [DomainExceptionCode.PasswordRecoveryCodeExpired]: HttpStatus.BAD_REQUEST,

    [DomainExceptionCode.Forbidden]: HttpStatus.FORBIDDEN,

    [DomainExceptionCode.NotFound]: HttpStatus.NOT_FOUND,

    [DomainExceptionCode.Unauthorized]: HttpStatus.UNAUTHORIZED,
    [DomainExceptionCode.InternalServerError]: HttpStatus.INTERNAL_SERVER_ERROR,
  };

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const result = response.status(
      this.domainToHTTPStatusMap[exception.code] ?? HttpStatus.I_AM_A_TEAPOT,
    );

    if (exception.code === DomainExceptionCode.ValidationError) {
      return result.json({ errorsMessages: exception.extensions });
    }

    return result.send();
  }
}
