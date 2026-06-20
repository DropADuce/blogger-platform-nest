export enum DomainExceptionCode {
  NotFound = 'Not Found',
  BadRequest = 'BadRequest',
  InternalServerError = 'InternalServerError',
  Forbidden = 'Forbidden',
  ValidationError = 'ValidationError',
  Unauthorized = 'Unauthorized',
  EmailNotConfirmed = 'EmailNotConfirmed',
  ConfirmationCodeExpired = 'ConfirmationCodeExpired',
  PasswordRecoveryCodeExpired = 'PasswordRecoveryCodeExpired',
}

export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  extensions: Array<Extension>;

  constructor(info: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Array<Extension>;
  }) {
    super(info.message);

    this.code = info.code;
    this.message = info.message;
    this.extensions = info.extensions ?? [];
  }
}
