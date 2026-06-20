import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllHTTPExceptionsFilter implements ExceptionFilter {
  catch(_: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
}
